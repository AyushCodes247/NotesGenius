import { AppError } from "@utils/general.util.js";

import {
  ConversationMemoryModel,
  ConversationModel,
} from "@models/conversation.model.js";

import searchWeb from "@ai/generators/tavily.generator.js";

interface ResolveQuizContextInput {
  userPublicId: string;
  conversationId?: string | undefined;
  topic?: string | undefined;
  context?: string | undefined;
}
interface ResolvedQuizContext {
  content: string;
  source: "provided" | "conversation" | "web";
}

const resolve = async ({
  userPublicId,
  conversationId,
  topic,
  context,
}: ResolveQuizContextInput): Promise<ResolvedQuizContext> => {
  if (context?.trim()) {
    return {
      content: context.trim(),
      source: "provided",
    };
  }

  if (conversationId) {
    const conversation = await ConversationModel.findOne({
      conversationId,
      userPublicId,
      deletedAt: { $exists: false },
    })
      .select({
        conversationId: 1,
        messages: 1,
      })
      .lean();

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    const conversationParts: string[] = [];

    const memory = await ConversationMemoryModel.findOne({
      userPublicId,
      scope: "CONVERSATION",
      conversationId,
    })
      .select({
        summary: 1,
        keyFacts: 1,
        topics: 1,
      })
      .lean();

    if (memory) {
      if (memory.summary?.trim()) {
        conversationParts.push(
          `Conversation Summary:\n${memory.summary.trim()}`,
        );
      }

      if (memory.keyFacts?.length) {
        conversationParts.push(
          `Key Facts:\n${memory.keyFacts
            .map((fact) => `- ${fact}`)
            .join("\n")}`,
        );
      }

      if (memory.topics?.length) {
        conversationParts.push(
          `Topics:\n${memory.topics
            .map((topicItem) => `- ${topicItem}`)
            .join("\n")}`,
        );
      }
    }

    const messages = conversation.messages
      .filter((message) => message.role !== "system" && message.content?.trim())
      .map(
        (message) =>
          `${message.role.toUpperCase()}:\n${message.content.trim()}`,
      );

    if (messages.length) {
      conversationParts.push(
        `Conversation Messages:\n${messages.join("\n\n")}`,
      );
    }

    const conversationContext = conversationParts.join("\n\n");

    if (conversationContext.trim()) {
      return {
        content: conversationContext,
        source: "conversation",
      };
    }
  }

  if (topic?.trim()) {
    const webResult = await searchWeb(topic.trim());

    if (!webResult.context.trim()) {
      throw new AppError(
        "Unable to find enough web context for the requested topic.",
        502,
      );
    }

    return {
      content: webResult.context.trim(),
      source: "web",
    };
  }

  throw new AppError(
    "No context was provided and no usable conversation or topic was found.",
    400,
  );
};

const quizContextService = {
  resolve,
};

export default quizContextService;
