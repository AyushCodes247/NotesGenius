import { ConversationModel } from "@models/conversation.model.js";
import NotesService from "@services/notes/index.service.js";

interface GetConversationInput {
  userPublicId: string;
  notesPublicId: string;
}

class ConversationService {
  async get({ userPublicId, notesPublicId }: GetConversationInput) {
    const note = await NotesService.getOne({
      userPublicId,
      notesPublicId,
    });

    if (!note.sourceDocumentId) {
      return null;
    }

    const conversation = await ConversationModel.findOne({
      userPublicId,
      documentPublicIds: note.sourceDocumentId,
      status: "ACTIVE",
      $or: [
        {
          deletedAt: {
            $exists: false,
          },
        },
        {
          deletedAt: null,
        },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!conversation) {
      return null;
    }

    return {
      conversationId: conversation.conversationId,

      title: conversation.title,

      messages: conversation.messages.map((message) => ({
        messageId: message.messageId,
        role: message.role,
        content: message.content,
        sources: message.sources ?? null,
        createdAt: message.createdAt,
      })),

      messageCount: conversation.messages.length,

      lastMessageAt: conversation.lastMessageAt ?? null,
    };
  }
}

export default new ConversationService();
