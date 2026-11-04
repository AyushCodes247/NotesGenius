import { Schema, model } from "mongoose";
import crypto from "node:crypto";

export type ConversationStatus = "ACTIVE" | "ARCHIVED";

export interface IConversation {
  conversationId: string;
  userPublicId: string;
  title: string;
  status: ConversationStatus;
  documentPublicIds: string[];
  lastMessageAt?: Date;
  deletedAt?: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      default: () => crypto.randomUUID(),
      required: true,
      unique: true,
    },

    userPublicId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },

    documentPublicIds: {
      type: [String],
      default: [],
    },

    lastMessageAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({
  userPublicId: 1,
  updatedAt: -1,
});

conversationSchema.index({
  userPublicId: 1,
  status: 1,
  updatedAt: -1,
});

export const ConversationModel = model<IConversation>(
  "Conversation",
  conversationSchema,
);

export type MemoryScope = "CONVERSATION" | "DOCUMENT";

export interface IConversationMemory {
  userPublicId: string;
  scope: MemoryScope;
  conversationId?: string;
  documentPublicId?: string;
  summary: string;
  keyFacts: string[];
  topics: string[];
  lastConsolidatedMessageId?: string;
  revision: number;
}

const conversationMemorySchema = new Schema<IConversationMemory>(
  {
    userPublicId: {
      type: String,
      required: true,
    },

    scope: {
      type: String,
      enum: ["CONVERSATION", "DOCUMENT"],
      required: true,
    },

    conversationId: {
      type: String,
      required: function (): boolean {
        return this.scope === "CONVERSATION";
      },
    },

    documentPublicId: {
      type: String,
      required: function (): boolean {
        return this.scope === "DOCUMENT";
      },
    },

    summary: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    keyFacts: {
      type: [
        {
          type: String,
          maxlength: 500,
        },
      ],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 50,
        message: "A memory cannot contain more than 50 key facts.",
      },
    },

    topics: {
      type: [
        {
          type: String,
          maxlength: 100,
        },
      ],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 30,
        message: "A memory cannot contain more than 30 topics.",
      },
    },

    lastConsolidatedMessageId: {
      type: String,
    },

    revision: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

conversationMemorySchema.pre("validate", function () {
  if (this.scope === "CONVERSATION" && this.documentPublicId) {
    this.invalidate(
      "documentPublicId",
      "Conversation memory cannot contain a documentPublicId.",
    );
  }

  if (this.scope === "DOCUMENT" && this.conversationId) {
    this.invalidate(
      "conversationId",
      "Document memory cannot contain a conversationId.",
    );
  }
});

conversationMemorySchema.index(
  {
    userPublicId: 1,
    conversationId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      scope: "CONVERSATION",
    },
  },
);

conversationMemorySchema.index(
  {
    userPublicId: 1,
    documentPublicId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      scope: "DOCUMENT",
    },
  },
);

export const ConversationMemoryModel = model<IConversationMemory>(
  "ConversationMemory",
  conversationMemorySchema,
);
