import { Router } from "express";
import auth from "@middlewares/auth.middleware.js";
import QuizController from "@controllers/quizzes/index.controller.js";
import validate from "@middlewares/validate.middleware.js";
import {
  generateQuizSchema,
  getQuizSchema,
  startAttemptSchema,
  saveAnswerSchema,
  submitAttemptSchema,
  getQuizStatsSchema,
  shareQuizSchema,
  getQuizSharesSchema,
  revokeQuizShareSchema,
} from "@validators/quizzes.validator.js";
import {
  aiGenerationRateLimit,
  retrievalRateLimit,
  answerRateLimit,
  sharingRateLimit,
} from "@utils/rateLimiters.util.js";

export const router: Router = Router();

router.get(
  "/shared",
  auth,
  retrievalRateLimit,
  QuizController.getSharedQuizzes,
);

router.get(
  "/:quizPublicId",
  auth,
  retrievalRateLimit,
  validate(getQuizSchema),
  QuizController.getByPublicId,
);

router.post(
  "/:notesPublicId",
  auth,
  aiGenerationRateLimit,
  validate(generateQuizSchema),
  QuizController.generate,
);

router.post(
  "/:quizPublicId/attempts",
  auth,
  retrievalRateLimit,
  validate(startAttemptSchema),
  QuizController.startAttempt,
);

router.put(
  "/attempts/:attemptPublicId/answers/:questionPublicId",
  auth,
  answerRateLimit,
  validate(saveAnswerSchema),
  QuizController.saveAnswer,
);

router.post(
  "/attempts/:attemptPublicId/submit",
  auth,
  answerRateLimit,
  validate(submitAttemptSchema),
  QuizController.submitAttempt,
);

router.get(
  "/:quizPublicId/stats",
  auth,
  retrievalRateLimit,
  validate(getQuizStatsSchema),
  QuizController.getStats,
);

router.post(
  "/:quizPublicId/share",
  auth,
  sharingRateLimit,
  validate(shareQuizSchema),
  QuizController.share,
);

router.get(
  "/:quizPublicId/shares",
  auth,
  retrievalRateLimit,
  validate(getQuizSharesSchema),
  QuizController.getQuizShares,
);

router.delete(
  "/:quizPublicId/share/:sharePublicId",
  auth,
  sharingRateLimit,
  validate(revokeQuizShareSchema),
  QuizController.revokeShare,
);
