import type { Request, Response, RequestHandler } from "express";
import { asyncHandler, AppError } from "@utils/general.util.js";
import QuizService from "@services/quizzes/index.service.js";

class QuizController {
  generate: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { notesPublicId } = req.params;

      if (!notesPublicId) {
        throw new AppError("Note public ID is required.", 400);
      }

      const { questionCount, difficulty } = req.body;

      const quiz = await QuizService.generateQuiz({
        userPublicId,
        notesPublicId: notesPublicId.toString(),
        questionCount,
        difficulty,
      });

      return res.status(201).json({
        success: true,
        message: "Quiz generated successfully.",
        quiz,
      });
    },
  );

  getByPublicId: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { quizPublicId } = req.params;

      if (!quizPublicId) {
        throw new AppError("Quiz public ID is required.", 400);
      }

      const quiz = await QuizService.getByPublicId({
        userPublicId,
        quizPublicId: quizPublicId.toString(),
      });

      return res.status(200).json({
        success: true,
        message: "Quiz retrieved successfully.",
        quiz,
      });
    },
  );

  startAttempt: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { quizPublicId } = req.params;

      if (!quizPublicId) {
        throw new AppError("Quiz public ID is required.", 400);
      }

      const attempt = await QuizService.startAttempt({
        userPublicId,
        quizPublicId: quizPublicId.toString(),
      });

      return res.status(201).json({
        success: true,
        message: "Quiz attempt started successfully.",
        attempt,
      });
    },
  );

  saveAnswer: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { attemptPublicId, questionPublicId } = req.params;

      if (!attemptPublicId) {
        throw new AppError("Attempt public ID is required.", 400);
      }

      if (!questionPublicId) {
        throw new AppError("Question public ID is required.", 400);
      }

      const { questionOptionId } = req.body;

      const answer = await QuizService.saveAnswer({
        userPublicId,
        attemptPublicId: attemptPublicId.toString(),
        questionPublicId: questionPublicId.toString(),
        questionOptionId,
      });

      return res.status(200).json({
        success: true,
        message: "Quiz answer saved successfully.",
        answer,
      });
    },
  );

  submitAttempt: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { attemptPublicId } = req.params;

      if (!attemptPublicId) {
        throw new AppError("Attempt public ID is required.", 400);
      }

      const attempt = await QuizService.submitAttempt({
        userPublicId,
        attemptPublicId: attemptPublicId.toString(),
      });

      return res.status(200).json({
        success: true,
        message: "Quiz attempt submitted successfully.",
        attempt,
      });
    },
  );

  getStats: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { quizPublicId } = req.params;

      if (!quizPublicId) {
        throw new AppError("Quiz public ID is required.", 400);
      }

      const stats = await QuizService.getQuizStats({
        userPublicId,
        quizPublicId: quizPublicId.toString(),
      });

      return res.status(200).json({
        success: true,
        message: "Quiz statistics retrieved successfully.",
        stats,
      });
    },
  );

  share: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { quizPublicId } = req.params;

      if (!quizPublicId) {
        throw new AppError("Quiz public ID is required.", 400);
      }

      const { userHandle } = req.body;

      const share = await QuizService.shareQuiz({
        userPublicId,
        quizPublicId: quizPublicId.toString(),
        userHandle,
      });

      return res.status(201).json({
        success: true,
        message: "Quiz shared successfully.",
        share,
      });
    },
  );

  getSharedQuizzes: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const quizzes = await QuizService.getSharedQuizzes({
        userPublicId,
      });

      return res.status(200).json({
        success: true,
        message: "Shared quizzes retrieved successfully.",
        quizzes,
      });
    },
  );

  revokeShare: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { quizPublicId, sharePublicId } = req.params;

      if (!quizPublicId || !sharePublicId) {
        throw new AppError(
          "Quiz public ID and share public ID are required.",
          400,
        );
      }

      const share = await QuizService.revokeQuizShare({
        userPublicId,
        quizPublicId: quizPublicId!.toString(),
        sharePublicId: sharePublicId!.toString(),
      });

      return res.status(200).json({
        success: true,
        message: "Quiz share revoked successfully.",
        share,
      });
    },
  );

  getQuizShares: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new AppError("Unauthorized.", 401);
      }

      const { quizPublicId } = req.params;

      if (!quizPublicId) {
        throw new AppError("Quiz public ID is required.", 400);
      }

      const result = await QuizService.getQuizShares({
        userPublicId,
        quizPublicId: quizPublicId!.toString(),
      });

      return res.status(200).json({
        success: true,
        message: "Quiz shares retrieved successfully.",
        ...result,
      });
    },
  );
}

export default new QuizController();
