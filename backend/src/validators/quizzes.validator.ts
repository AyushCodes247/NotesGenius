import { z } from "zod";

const quizPublicIdValidator = z.string().uuid("Invalid quiz public ID.");

const notesPublicIdValidator = z.string().uuid("Invalid note public ID.");

const attemptPublicIdValidator = z.string().uuid("Invalid attempt public ID.");

const questionPublicIdValidator = z
  .string()
  .uuid("Invalid question public ID.");

const questionOptionIdValidator = z
  .string()
  .uuid("Invalid question option ID.");

const sharePublicIdValidator = z.string().uuid("Invalid share public ID.");

const userHandleValidator = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@/, "").toLowerCase())
  .pipe(
    z
      .string()
      .min(3, "User handle must be at least 3 characters.")
      .max(30, "User handle cannot exceed 30 characters.")
      .regex(
        /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
        "User handle can contain only lowercase letters, numbers, and single underscores.",
      ),
  );

export const generateQuizSchema = z.object({
  params: z.object({
    notesPublicId: notesPublicIdValidator,
  }),

  body: z
    .object({
      questionCount: z
        .union([z.literal(5), z.literal(10), z.literal(15)])
        .default(5),

      difficulty: z.enum(["easy", "medium", "hard"], {
        message: "Difficulty must be easy, medium, or hard.",
      }),
    })
    .strict(),
});

export const getQuizSchema = z.object({
  params: z.object({
    quizPublicId: quizPublicIdValidator,
  }),
});

export const startAttemptSchema = z.object({
  params: z.object({
    quizPublicId: quizPublicIdValidator,
  }),
});

export const saveAnswerSchema = z.object({
  params: z.object({
    attemptPublicId: attemptPublicIdValidator,
    questionPublicId: questionPublicIdValidator,
  }),

  body: z
    .object({
      questionOptionId: questionOptionIdValidator,
    })
    .strict(),
});

export const submitAttemptSchema = z.object({
  params: z.object({
    attemptPublicId: attemptPublicIdValidator,
  }),
});

export const getQuizStatsSchema = z.object({
  params: z.object({
    quizPublicId: quizPublicIdValidator,
  }),
});

export const shareQuizSchema = z.object({
  params: z.object({
    quizPublicId: quizPublicIdValidator,
  }),

  body: z
    .object({
      userHandle: userHandleValidator,
    })
    .strict(),
});

export const getQuizSharesSchema = z.object({
  params: z.object({
    quizPublicId: quizPublicIdValidator,
  }),
});

export const revokeQuizShareSchema = z.object({
  params: z.object({
    quizPublicId: quizPublicIdValidator,
    sharePublicId: sharePublicIdValidator,
  }),
});
