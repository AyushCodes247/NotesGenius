import db from "@/index.js";
import { documentMetaTable } from "@schemas/documentMeta.schema";
import { noteTable } from "@schemas/note.schema";
import { AppError, generateCheckSumSha256 } from "@utils/general.util.js";
import { ingestDocument } from "@pipes/ingest.pipe.js";
import { and, eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import {
  ConversationMemoryModel,
  ConversationModel,
} from "@models/conversation.model.js";
import geminiService from "@ai/services/gemini.service.js";
import { queryDocument } from "@/pipes/docQuery.pipe.js";
import crypto from "node:crypto";

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

    console.log("DISCUSS DOCUMENT DEBUG", {
      notesPublicId,
      sourceDocumentId: note.sourceDocumentId,
      conversationId,
    });

    if (note.sourceDocumentId) {
      const ragResult = await queryDocument(note.sourceDocumentId, normalizedQuery);
      documentContext = ragResult.context;
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

      sources: note.sourceDocumentId
        ? {
            documentPublicId: note.sourceDocumentId,
          }
        : null,

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

      console.error(`RAG ingestion failed for ${document.publicId}:`, error);

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
          console.error("Failed to delete temporary uploaded file:", error);
        }
      }
    }
  }
}

export default new NotesService();
