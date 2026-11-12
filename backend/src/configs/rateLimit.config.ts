import env from "@configs/env.config.js";

export const rateLimitConfig = {
  app: {
    windowSeconds: env.RATE_LIMIT_APP_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_APP_MAX_REQUESTS,
  },

  auth: {
    windowSeconds: env.RATE_LIMIT_AUTH_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_AUTH_MAX_REQUESTS,
  },

  upload: {
    windowSeconds: env.RATE_LIMIT_UPLOAD_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_UPLOAD_MAX_REQUESTS,
  },

  aiGeneration: {
    windowSeconds: env.RATE_LIMIT_AI_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_AI_MAX_REQUESTS,
  },

  conversation: {
    windowSeconds: env.RATE_LIMIT_CONVERSATION_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_CONVERSATION_MAX_REQUESTS,
  },

  retrieval: {
    windowSeconds: env.RATE_LIMIT_RETRIEVAL_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_RETRIEVAL_MAX_REQUESTS,
  },

  answer: {
    windowSeconds: env.RATE_LIMIT_ANSWER_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_ANSWER_MAX_REQUESTS,
  },

  sharing: {
    windowSeconds: env.RATE_LIMIT_SHARING_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_SHARING_MAX_REQUESTS,
  },

  profile: {
    windowSeconds: env.RATE_LIMIT_PROFILE_WINDOW_SECONDS,
    maxRequests: env.RATE_LIMIT_PROFILE_MAX_REQUESTS,
  },
} as const;
