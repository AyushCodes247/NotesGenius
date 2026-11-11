import { z } from "zod";

const quizOptionSchema = z.object({
  optionNumber: z.number().int().min(1).max(4),
  optionText: z.string().trim().min(1),
});

const quizQuestionSchema = z
  .object({
    questionNumber: z.number().int().min(1),

    questionText: z.string().trim().min(1),

    options: z.array(quizOptionSchema).length(4),

    correctOptionNumber: z.number().int().min(1).max(4),

    explanation: z.string().trim().min(1),

    hint: z.string().trim().min(1),
  })
  .superRefine((question, ctx) => {
    const optionNumbers = question.options.map((option) => option.optionNumber);

    const uniqueOptionNumbers = new Set(optionNumbers);

    if (uniqueOptionNumbers.size !== optionNumbers.length) {
      ctx.addIssue({
        code: "custom",
        message: "Option numbers must be unique.",
        path: ["options"],
      });
    }

    if (!optionNumbers.includes(question.correctOptionNumber)) {
      ctx.addIssue({
        code: "custom",
        message: "Correct option must exist in the options.",
        path: ["correctOptionNumber"],
      });
    }
  });

export const generatedQuizSchema = z
  .object({
    questions: z.array(quizQuestionSchema).min(1),
  })
  .superRefine((quiz, ctx) => {
    const questionNumbers = quiz.questions.map(
      (question) => question.questionNumber,
    );

    const uniqueQuestionNumbers = new Set(questionNumbers);

    if (uniqueQuestionNumbers.size !== questionNumbers.length) {
      ctx.addIssue({
        code: "custom",
        message: "Question numbers must be unique.",
        path: ["questions"],
      });
    }

    const expectedQuestionNumbers = quiz.questions.map((_, index) => index + 1);

    const isSequential = quiz.questions.every(
      (question, index) =>
        question.questionNumber === expectedQuestionNumbers[index],
    );

    if (!isSequential) {
      ctx.addIssue({
        code: "custom",
        message: "Question numbers must be sequential starting from 1.",
        path: ["questions"],
      });
    }

    const hasInvalidOptionNumbers = quiz.questions.some((question) => {
      const optionNumbers = question.options
        .map((option) => option.optionNumber)
        .sort((a, b) => a - b);

      return (
        optionNumbers.length !== 4 ||
        optionNumbers.some((optionNumber, index) => optionNumber !== index + 1)
      );
    });

    if (hasInvalidOptionNumbers) {
      ctx.addIssue({
        code: "custom",
        message:
          "Each question must have options numbered sequentially from 1 to 4.",
        path: ["questions"],
      });
    }
  });

export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>;

export type GeneratedQuizQuestion = z.infer<typeof quizQuestionSchema>;

export type GeneratedQuizOption = z.infer<typeof quizOptionSchema>;
