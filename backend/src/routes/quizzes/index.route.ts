import { Router } from "express";
import auth from "@middlewares/auth.middleware.js";
import QuizController from "@controllers/quizzes/index.controller.js";
import { shareQuizSchema } from "@validators/index.validator.js";
import validator from "@middlewares/validate.middleware.js";

export const router: Router = Router();

// quizzes shared
router.get("/shared", auth, QuizController.getSharedQuizzes);

// quizzes retrieval
router.get("/:quizPublicId", auth, QuizController.getByPublicId);

// quizzes generation
router.post("/:notesPublicId", auth, QuizController.generate);

// quizzes attempt start
router.post("/:quizPublicId/attempts", auth, QuizController.startAttempt);

// quizzes answer updating
router.put(
  "/attempts/:attemptPublicId/answers/:questionPublicId",
  auth,
  QuizController.saveAnswer,
);

// quizzes attempt submission
router.post(
  "/attempts/:attemptPublicId/submit",
  auth,
  QuizController.submitAttempt,
);

// quizzes attempt stats
router.get("/:quizPublicId/stats", auth, QuizController.getStats);

// quizzes share
router.post("/:quizPublicId/share", auth, QuizController.share);

router.get("/:quizPublicId/shares", auth, QuizController.getQuizShares);

router.delete(
  "/:quizPublicId/share/:sharePublicId",
  auth,
  QuizController.revokeShare,
);
