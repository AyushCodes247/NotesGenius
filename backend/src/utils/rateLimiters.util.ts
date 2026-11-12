import type { RequestHandler } from "express";

import rateLimit from "@middlewares/rateLimit.middleware.js";
import { rateLimitConfig } from "@configs/rateLimit.config.js";

export const appRateLimit: RequestHandler = rateLimit({
  keyPrefix: "app",
  windowSeconds: rateLimitConfig.app.windowSeconds,
  maxRequests: rateLimitConfig.app.maxRequests,
  failMode: "open",
});

export const authRateLimit: RequestHandler = rateLimit({
  keyPrefix: "auth",
  windowSeconds: rateLimitConfig.auth.windowSeconds,
  maxRequests: rateLimitConfig.auth.maxRequests,
  failMode: "closed",
});

export const uploadRateLimit: RequestHandler = rateLimit({
  keyPrefix: "upload",
  windowSeconds: rateLimitConfig.upload.windowSeconds,
  maxRequests: rateLimitConfig.upload.maxRequests,
  failMode: "closed",
});

export const aiGenerationRateLimit: RequestHandler = rateLimit({
  keyPrefix: "ai-generation",
  windowSeconds: rateLimitConfig.aiGeneration.windowSeconds,
  maxRequests: rateLimitConfig.aiGeneration.maxRequests,
  failMode: "closed",
});

export const conversationRateLimit: RequestHandler = rateLimit({
  keyPrefix: "conversation",
  windowSeconds: rateLimitConfig.conversation.windowSeconds,
  maxRequests: rateLimitConfig.conversation.maxRequests,
  failMode: "closed",
});

export const retrievalRateLimit: RequestHandler = rateLimit({
  keyPrefix: "retrieval",
  windowSeconds: rateLimitConfig.retrieval.windowSeconds,
  maxRequests: rateLimitConfig.retrieval.maxRequests,
  failMode: "open",
});

export const answerRateLimit: RequestHandler = rateLimit({
  keyPrefix: "answer",
  windowSeconds: rateLimitConfig.answer.windowSeconds,
  maxRequests: rateLimitConfig.answer.maxRequests,
  failMode: "open",
});

export const sharingRateLimit: RequestHandler = rateLimit({
  keyPrefix: "sharing",
  windowSeconds: rateLimitConfig.sharing.windowSeconds,
  maxRequests: rateLimitConfig.sharing.maxRequests,
  failMode: "open",
});

export const profileRateLimit: RequestHandler = rateLimit({
  keyPrefix: "profile",
  windowSeconds: rateLimitConfig.profile.windowSeconds,
  maxRequests: rateLimitConfig.profile.maxRequests,
  failMode: "open",
});
