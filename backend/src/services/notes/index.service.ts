import db from "@/index.js";
import { documentMetaTable } from "@schemas/documentMeta.schema";
import { noteTable } from "@schemas/note.schema";
import {
  AppError,
  generateCheckSumSha256,
  generateNotePdfKey,
} from "@utils/general.util.js";
import { ingestDocument } from "@pipes/ingest.pipe.js";
import { and, eq, desc, isNull } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import {
  ConversationMemoryModel,
  ConversationModel,
} from "@models/conversation.model.js";
import geminiService from "@ai/services/gemini.service.js";
import { queryDocument } from "@/pipes/docQuery.pipe.js";
import crypto from "node:crypto";
import searchWeb from "@ai/generators/tavily.generator.js";
import s3Service from "./s3.service.js";
import { generateNotePdf } from "@utils/pdf.util.js";
import notesCacheService from "./cache.service.js";
import { noteShareTable } from "@schemas/notesShare.schema";
import { userTable } from "@schemas/user.schema";
import logger from "@/utils/logger.util.js";

interface UploadInput {
  userPublicId: string;
  file: Express.Multer.File;
  notesPublicId: string;
}

interface DiscussInput {
  command: string;
  query: string;
  notesPublicId: string;
  userPublicId: string;
  conversationId?: string;
}

interface CreationInput {
  userPublicId: string;
  title: string;
}

interface UpdateInput {
  userPublicId: string;
  notesPublicId: string;
  title?: string;
  visibility?: "private" | "public";
  topic?: string | null;
}

interface ShareInput {
  userPublicId: string;
  notesPublicId: string;
  recipientUserHandle: string;
}

class NotesService {
  async create({ userPublicId, title }: CreationInput) {
    const [note] = await db
      .insert(noteTable)
      .values({
        title,
        userId: userPublicId,
        content: "",
        generationMode: "topic",
        visibility: "private",
      })
      .returning({
        publicId: noteTable.publicId,
        title: noteTable.title,
        visibility: noteTable.visibility,
        createdAt: noteTable.createdAt,
        updatedAt: noteTable.updatedAt,
      });

    if (!note) {
      throw new AppError("Failed to create note.", 500);
    }

    return note;
  }

  async discuss({
    notesPublicId,
    query,
    command,
    userPublicId,
    conversationId,
  }: DiscussInput) {
    const normalizedQuery = query.trim();
    const normalizedCommand = command.trim();

    if (!normalizedQuery) {
      throw new AppError("query is required.", 400);
    }

    if (!normalizedCommand) {
      throw new AppError("command is required.", 400);
    }

    const [note] = await db
      .select({
        publicId: noteTable.publicId,
        title: noteTable.title,
        content: noteTable.content,
        sourceDocumentId: noteTable.sourceDocumentId,
        sourceText: noteTable.sourceText,
        topic: noteTable.topic,
        generationMode: noteTable.generationMode,
        visibility: noteTable.visibility,
      })
      .from(noteTable)
      .where(
        and(
          eq(noteTable.publicId, notesPublicId),
          eq(noteTable.userId, userPublicId),
        ),
      );

    if (!note) {
      throw new AppError("note not found.", 404);
    }

    let conversation;

    if (conversationId) {
      conversation = await ConversationModel.findOne({
        conversationId,
        userPublicId,
        status: "ACTIVE",
        deletedAt: { $exists: false },
      });

      if (!conversation) {
        throw new AppError("Conversation not found.", 404);
      }

      if (
        note.sourceDocumentId &&
        !conversation.documentPublicIds.includes(note.sourceDocumentId)
      ) {
        conversation.documentPublicIds.push(note.sourceDocumentId);
      }
    } else {
      conversation = new ConversationModel({
        userPublicId,
        title: note.title,
        status: "ACTIVE",
        documentPublicIds: note.sourceDocumentId ? [note.sourceDocumentId] : [],
        messages: [],
      });
    }

    const conversationMemory = await ConversationMemoryModel.findOne({
      userPublicId,
      scope: "CONVERSATION",
      conversationId: conversation.conversationId,
    }).lean();

    let documentMemory = null;

    if (note.sourceDocumentId) {
      documentMemory = await ConversationMemoryModel.findOne({
        userPublicId,
        scope: "DOCUMENT",
        documentPublicId: note.sourceDocumentId,
      }).lean();
    }

    let documentContext = "";

    let webContext = "";

    let webSources: {
      title: string;
      url: string;
      favicon: string | undefined;
    }[] = [];

    if (note.sourceDocumentId) {
      const ragResult = await queryDocument(
        note.sourceDocumentId,
        normalizedQuery,
      );

      documentContext = ragResult.context;
    } else {
      const webResult = await searchWeb(normalizedQuery);

      webContext = webResult.context;
      webSources = webResult.sources;
    }

    const memoryParts: string[] = [];

    if (documentMemory) {
      if (documentMemory.summary) {
        memoryParts.push(`Document memory:\n${documentMemory.summary}`);
      }

      if (documentMemory.keyFacts.length > 0) {
        memoryParts.push(
          `Document key facts:\n${documentMemory.keyFacts
            .map((fact) => `- ${fact}`)
            .join("\n")}`,
        );
      }

      if (documentMemory.topics.length > 0) {
        memoryParts.push(
          `Document topics:\n${documentMemory.topics.join(", ")}`,
        );
      }
    }

    if (conversationMemory) {
      if (conversationMemory.summary) {
        memoryParts.push(`Conversation memory:\n${conversationMemory.summary}`);
      }

      if (conversationMemory.keyFacts.length > 0) {
        memoryParts.push(
          `Conversation key facts:\n${conversationMemory.keyFacts
            .map((fact) => `- ${fact}`)
            .join("\n")}`,
        );
      }

      if (conversationMemory.topics.length > 0) {
        memoryParts.push(
          `Conversation topics:\n${conversationMemory.topics.join(", ")}`,
        );
      }
    }

    const conversationMessages = conversation.messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n\n");

    const contextParts = [
      documentContext
        ? `Relevant document information:\n${documentContext}`
        : "",

      webContext ? `Relevant web information:\n${webContext}` : "",

      note.sourceText ? `Note source text:\n${note.sourceText}` : "",

      note.topic ? `Note topic:\n${note.topic}` : "",

      memoryParts.length > 0 ? memoryParts.join("\n\n") : "",

      conversationMessages
        ? `Previous conversation:\n${conversationMessages}`
        : "",
    ].filter(Boolean);

    const context = contextParts.join("\n\n");

    const answer = await geminiService({
      query: `${normalizedCommand} ${normalizedQuery}`,
      context: context || "",
    });

    let pdfUrl: string | undefined;
    let pdfStorageKey: string | undefined;

    if (normalizedCommand === "@create") {
      const pdfBuffer = await generateNotePdf({
        title: note.title,
        content: answer,
      });

      pdfStorageKey = generateNotePdfKey(note.publicId);

      await s3Service.uploadFile({
        buffer: pdfBuffer,
        key: pdfStorageKey,
        contentType: "application/pdf",
      });

      pdfUrl = await s3Service.getSignedUrlForFile(pdfStorageKey);

      await db
        .update(noteTable)
        .set({ content: answer, pdfStorageKey, pdfUrl, updatedAt: new Date() })
        .where(
          and(
            eq(noteTable.publicId, notesPublicId),
            eq(noteTable.userId, userPublicId),
          ),
        );

      await notesCacheService.invalidateNote(userPublicId, note.publicId);
    }

    conversation.messages.push({
      messageId: crypto.randomUUID(),
      role: "user",
      content: normalizedQuery,
      createdAt: new Date(),
    });

    conversation.messages.push({
      messageId: crypto.randomUUID(),
      role: "assistant",
      content: answer,
      createdAt: new Date(),
    });

    conversation.lastMessageAt = new Date();

    await conversation.save();

    return {
      conversationId: conversation.conversationId,

      note: {
        publicId: note.publicId,
        title: note.title,
      },

      response: answer,

      pdf:
        normalizedCommand === "@create"
          ? {
              storageKey: pdfStorageKey,
              url: pdfUrl,
            }
          : { storageKey: "", url: "" },

      sources: note.sourceDocumentId
        ? {
            type: "document",
            documentPublicId: note.sourceDocumentId,
          }
        : {
            type: "web",
            results: webSources,
          },

      messageCount: conversation.messages.length,
    };
  }

  async upload({ userPublicId, file, notesPublicId }: UploadInput) {
    const [note] = await db
      .select({
        publicId: noteTable.publicId,
        title: noteTable.title,
        visibility: noteTable.visibility,
        createdAt: noteTable.createdAt,
      })
      .from(noteTable)
      .where(
        and(
          eq(noteTable.publicId, notesPublicId),
          eq(noteTable.userId, userPublicId),
        ),
      )
      .limit(1);

    if (!note) {
      throw new AppError("Note not found.", 404);
    }

    const checksumSha256 = await generateCheckSumSha256(file.path);

    const storageKey = file.path;

    const [document] = await db
      .insert(documentMetaTable)
      .values({
        userId: userPublicId,
        originalFileName: file.originalname,
        fileSizeBytes: BigInt(file.size),
        mimeType: file.mimetype,
        checksumSha256,
        processingStatus: "pending",
        storageKey,
      })
      .returning({
        publicId: documentMetaTable.publicId,
        originalFileName: documentMetaTable.originalFileName,
        processingStatus: documentMetaTable.processingStatus,
      });

    if (!document) {
      throw new AppError("Failed to create document metadata.", 500);
    }

    try {
      await db
        .update(documentMetaTable)
        .set({
          processingStatus: "processing",
        })
        .where(eq(documentMetaTable.publicId, document.publicId));

      await ingestDocument(file.path, document.publicId, file.mimetype);

      const [completedDocument] = await db
        .update(documentMetaTable)
        .set({
          processingStatus: "completed",
          processedAt: new Date(),
        })
        .where(eq(documentMetaTable.publicId, document.publicId))
        .returning({
          publicId: documentMetaTable.publicId,
          originalFileName: documentMetaTable.originalFileName,
          processingStatus: documentMetaTable.processingStatus,
        });

      if (!completedDocument) {
        throw new AppError(
          "Document was processed but could not be updated.",
          500,
        );
      }

      const [updatedNote] = await db
        .update(noteTable)
        .set({
          sourceDocumentId: completedDocument.publicId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(noteTable.publicId, notesPublicId),
            eq(noteTable.userId, userPublicId),
          ),
        )
        .returning({
          publicId: noteTable.publicId,
          title: noteTable.title,
          visibility: noteTable.visibility,
          createdAt: noteTable.createdAt,
        });

      if (!updatedNote) {
        throw new AppError(
          "Document processed but could not be attached to note.",
          500,
        );
      }

      await notesCacheService.invalidateNote(userPublicId, note.publicId);

      return {
        public_id: updatedNote.publicId,
        title: updatedNote.title,
        source: {
          file_public_id: completedDocument.publicId,
          filename: completedDocument.originalFileName,
          processing_status: "uploaded",
        },
        visibility: updatedNote.visibility,
        created_at: updatedNote.createdAt,
      };
    } catch (error) {
      await db
        .update(documentMetaTable)
        .set({
          processingStatus: "failed",
        })
        .where(eq(documentMetaTable.publicId, document.publicId));

      logger.error(
        {
          err: error instanceof Error ? error : new Error(String(error)),
          documentPublicId: document.publicId,
        },
        "RAG ingestion failed.",
      );

      throw new AppError(
        "Failed to process uploaded document.",
        500,
        error instanceof Error ? error : undefined,
      );
    } finally {
      try {
        await unlink(file.path);
      } catch (error) {
        const fileError = error as NodeJS.ErrnoException;

        if (fileError.code !== "ENOENT") {
          logger.error(
            {
              err: error instanceof Error ? error : new Error(String(error)),
              filePath: file.path,
            },
            "Failed to delete temporary uploaded file.",
          );
        }
      }
    }
  }

  async getAll({ userPublicId }: { userPublicId: string }) {
    const cachedNotes = await notesCacheService.get(userPublicId, "all");

    if (cachedNotes) {
      return cachedNotes;
    }

    const notes = await db
      .select({
        publicId: noteTable.publicId,
        title: noteTable.title,
        content: noteTable.content,
        sourceText: noteTable.sourceText,
        topic: noteTable.topic,
        visibility: noteTable.visibility,
        pdfUrl: noteTable.pdfUrl,
        createdAt: noteTable.createdAt,
        updatedAt: noteTable.updatedAt,
      })
      .from(noteTable)
      .where(
        and(eq(noteTable.userId, userPublicId), isNull(noteTable.deletedAt)),
      )
      .orderBy(desc(noteTable.updatedAt));

    await notesCacheService.set(userPublicId, "all", notes);

    return notes;
  }

  async getOne({
    userPublicId,
    notesPublicId,
  }: {
    userPublicId: string;
    notesPublicId: string;
  }) {
    const cachedNote = await notesCacheService.get(
      userPublicId,
      "single",
      notesPublicId,
    );

    if (cachedNote && cachedNote.publicId === notesPublicId) {
      return cachedNote;
    }

    if (cachedNote) {
      await notesCacheService.invalidate(userPublicId, "single", notesPublicId);
    }

    const [note] = await db
      .select({
        publicId: noteTable.publicId,
        title: noteTable.title,
        content: noteTable.content,
        sourceText: noteTable.sourceText,
        topic: noteTable.topic,
        visibility: noteTable.visibility,
        pdfUrl: noteTable.pdfUrl,
        createdAt: noteTable.createdAt,
        updatedAt: noteTable.updatedAt,
      })
      .from(noteTable)
      .where(
        and(
          eq(noteTable.publicId, notesPublicId),
          eq(noteTable.userId, userPublicId),
          isNull(noteTable.deletedAt),
        ),
      )
      .limit(1);

    if (!note) {
      throw new AppError("Note not found.", 404);
    }

    await notesCacheService.set(userPublicId, "single", note, notesPublicId);

    return note;
  }

  async update({
    userPublicId,
    notesPublicId,
    title,
    visibility,
    topic,
  }: UpdateInput) {
    const values: {
      title?: string;
      visibility?: "private" | "public";
      topic?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      const normalizedTitle = title.trim();

      if (!normalizedTitle) {
        throw new AppError("Title cannot be empty.", 400);
      }

      values.title = normalizedTitle;
    }

    if (visibility !== undefined) {
      values.visibility = visibility;
    }

    if (topic !== undefined) {
      values.topic = topic?.trim() || null;
    }

    const [updatedNote] = await db
      .update(noteTable)
      .set(values)
      .where(
        and(
          eq(noteTable.publicId, notesPublicId),
          eq(noteTable.userId, userPublicId),
          isNull(noteTable.deletedAt),
        ),
      )
      .returning({
        publicId: noteTable.publicId,
        title: noteTable.title,
        content: noteTable.content,
        sourceText: noteTable.sourceText,
        topic: noteTable.topic,
        visibility: noteTable.visibility,
        pdfUrl: noteTable.pdfUrl,
        createdAt: noteTable.createdAt,
        updatedAt: noteTable.updatedAt,
      });

    if (!updatedNote) {
      throw new AppError("Note not found.", 404);
    }

    await notesCacheService.invalidateNote(userPublicId, notesPublicId);

    return updatedNote;
  }
  async delete({
    userPublicId,
    notesPublicId,
  }: {
    userPublicId: string;
    notesPublicId: string;
  }) {
    const [note] = await db
      .select({
        publicId: noteTable.publicId,
        pdfStorageKey: noteTable.pdfStorageKey,
      })
      .from(noteTable)
      .where(
        and(
          eq(noteTable.publicId, notesPublicId),
          eq(noteTable.userId, userPublicId),
          isNull(noteTable.deletedAt),
        ),
      )
      .limit(1);

    if (!note) {
      throw new AppError("Note not found.", 404);
    }

    const recipients = await db
      .select({
        recipientUserId: noteShareTable.recipientUserId,
      })
      .from(noteShareTable)
      .where(
        and(
          eq(noteShareTable.noteId, notesPublicId),
          isNull(noteShareTable.revokedAt),
        ),
      );

    if (note.pdfStorageKey) {
      await s3Service.deleteFile(note.pdfStorageKey);
    }

    const now = new Date();

    const [deletedNote] = await db
      .update(noteTable)
      .set({
        pdfUrl: null,
        pdfStorageKey: null,
        deletedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(noteTable.publicId, notesPublicId),
          eq(noteTable.userId, userPublicId),
          isNull(noteTable.deletedAt),
        ),
      )
      .returning({
        publicId: noteTable.publicId,
      });

    if (!deletedNote) {
      throw new AppError("Failed to delete note.", 500);
    }

    // Revoke all active shares because the note no longer exists logically.
    await db
      .update(noteShareTable)
      .set({
        revokedAt: now,
      })
      .where(
        and(
          eq(noteShareTable.noteId, notesPublicId),
          isNull(noteShareTable.revokedAt),
        ),
      );

    // Invalidate owner's caches.
    await notesCacheService.invalidateNote(userPublicId, notesPublicId);

    // Invalidate every recipient's cached copy.
    await Promise.all(
      recipients.map(({ recipientUserId }) =>
        notesCacheService.invalidateNote(recipientUserId, notesPublicId),
      ),
    );

    return deletedNote;
  }

  async share({
    userPublicId,
    notesPublicId,
    recipientUserHandle,
  }: ShareInput) {
    const [note] = await db
      .select({
        publicId: noteTable.publicId,
        pdfUrl: noteTable.pdfUrl,
      })
      .from(noteTable)
      .where(
        and(
          eq(noteTable.publicId, notesPublicId),
          eq(noteTable.userId, userPublicId),
          isNull(noteTable.deletedAt),
        ),
      )
      .limit(1);

    if (!note) {
      throw new AppError("Note not found.", 404);
    }

    const [recipient] = await db
      .select({
        publicId: userTable.publicId,
        userHandle: userTable.userHandle,
      })
      .from(userTable)
      .where(eq(userTable.userHandle, recipientUserHandle))
      .limit(1);

    if (!recipient) {
      throw new AppError("Recipient user not found.", 404);
    }

    if (recipient.publicId === userPublicId) {
      throw new AppError("You cannot share a note with yourself.", 400);
    }

    const [existingShare] = await db
      .select({
        publicId: noteShareTable.publicId,
        revokedAt: noteShareTable.revokedAt,
      })
      .from(noteShareTable)
      .where(
        and(
          eq(noteShareTable.noteId, notesPublicId),
          eq(noteShareTable.recipientUserId, recipient.publicId),
        ),
      )
      .limit(1);

    if (existingShare) {
      if (!existingShare.revokedAt) {
        throw new AppError("Note is already shared with this user.", 409);
      }

      const [reshared] = await db
        .update(noteShareTable)
        .set({
          revokedAt: null,
          pdfUrl: note.pdfUrl,
        })
        .where(eq(noteShareTable.publicId, existingShare.publicId))
        .returning({
          publicId: noteShareTable.publicId,
          noteId: noteShareTable.noteId,
          pdfUrl: noteShareTable.pdfUrl,
          recipientUserId: noteShareTable.recipientUserId,
          createdAt: noteShareTable.createdAt,
          revokedAt: noteShareTable.revokedAt,
        });

      if (!reshared) {
        throw new AppError("Failed to restore note share.", 500);
      }

      return reshared;
    }

    const [share] = await db
      .insert(noteShareTable)
      .values({
        noteId: notesPublicId,
        pdfUrl: note.pdfUrl,
        recipientUserId: recipient.publicId,
      })
      .returning({
        publicId: noteShareTable.publicId,
        noteId: noteShareTable.noteId,
        pdfUrl: noteShareTable.pdfUrl,
        recipientUserId: noteShareTable.recipientUserId,
        createdAt: noteShareTable.createdAt,
        revokedAt: noteShareTable.revokedAt,
      });

    if (!share) {
      throw new AppError("Failed to share note.", 500);
    }

    return share;
  }

  async getShared({ userPublicId }: { userPublicId: string }) {
    const sharedNotes = await db
      .select({
        publicId: noteTable.publicId,
        title: noteTable.title,
        content: noteTable.content,
        sourceText: noteTable.sourceText,
        topic: noteTable.topic,
        visibility: noteTable.visibility,
        pdfUrl: noteTable.pdfUrl,
        createdAt: noteTable.createdAt,
        updatedAt: noteTable.updatedAt,

        sharePublicId: noteShareTable.publicId,
        sharedAt: noteShareTable.createdAt,
      })
      .from(noteShareTable)
      .innerJoin(noteTable, eq(noteShareTable.noteId, noteTable.publicId))
      .where(
        and(
          eq(noteShareTable.recipientUserId, userPublicId),
          isNull(noteShareTable.revokedAt),
          isNull(noteTable.deletedAt),
        ),
      )
      .orderBy(desc(noteShareTable.createdAt));

    return sharedNotes;
  }

  async revokeShare({
    userPublicId,
    notesPublicId,
    sharePublicId,
  }: {
    userPublicId: string;
    notesPublicId: string;
    sharePublicId: string;
  }) {
    // Verify that the requester owns the note
    const [note] = await db
      .select({
        publicId: noteTable.publicId,
      })
      .from(noteTable)
      .where(
        and(
          eq(noteTable.publicId, notesPublicId),
          eq(noteTable.userId, userPublicId),
          isNull(noteTable.deletedAt),
        ),
      )
      .limit(1);

    if (!note) {
      throw new AppError("Note not found.", 404);
    }

    const [revokedShare] = await db
      .update(noteShareTable)
      .set({
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(noteShareTable.publicId, sharePublicId),
          eq(noteShareTable.noteId, notesPublicId),
          isNull(noteShareTable.revokedAt),
        ),
      )
      .returning({
        publicId: noteShareTable.publicId,
        noteId: noteShareTable.noteId,
        recipientUserId: noteShareTable.recipientUserId,
        revokedAt: noteShareTable.revokedAt,
      });

    if (!revokedShare) {
      throw new AppError("Active note share not found.", 404);
    }

    // Invalidate the recipient's cached note
    await notesCacheService.invalidateNote(
      revokedShare.recipientUserId,
      notesPublicId,
    );

    return revokedShare;
  }
}

export default new NotesService();
