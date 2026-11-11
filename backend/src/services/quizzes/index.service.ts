import { and, eq, isNull, desc } from "drizzle-orm";
import db from "@/index.js";
import { AppError } from "@utils/general.util.js";
import { noteTable } from "@schemas/note.schema";
import { quizTable } from "@schemas/quiz.schema";
import { quizQuestionTable } from "@schemas/quizQuestion.schema";
import { quizOptionTable } from "@schemas/quizOption.schema";
import { quizAttemptTable } from "@schemas/quizAttempt.schema";
import { quizAnswerTable } from "@schemas/quizAnswer.schema";
import { userTable } from "@schemas/user.schema";
import { quizShareTable } from "@schemas/quizShare.schema";
import quizPrompt from "@ai/prompts/quiz.prompt.js";
import generateQuizContent from "@ai/generators/geminiQuiz.generator.js";
import quizContextService from "./context.service.js";

interface GenerateQuizInput {
  userPublicId: string;

  notesPublicId?: string;
  conversationId?: string;
  topic?: string;
  context?: string;

  questionCount: 5 | 10 | 15;
  difficulty: "easy" | "medium" | "hard";
}

class QuizService {
  async generateQuiz({
    userPublicId,
    notesPublicId,
    conversationId,
    topic,
    context,
    questionCount,
    difficulty,
  }: GenerateQuizInput) {
    let note: {
      publicId: string;
      title: string;
      content: string;
    } | null = null;

    if (notesPublicId) {
      const [existingNote] = await db
        .select({
          publicId: noteTable.publicId,
          title: noteTable.title,
          content: noteTable.content,
        })
        .from(noteTable)
        .where(
          and(
            eq(noteTable.publicId, notesPublicId),
            eq(noteTable.userId, userPublicId),
            isNull(noteTable.deletedAt),
          ),
        )
        .limit(1);

      if (!existingNote) {
        throw new AppError("Note not found.", 404);
      }

      note = existingNote;
    }

    const generationMode = note ? "note" : "topic";

    const [quiz] = await db
      .insert(quizTable)
      .values({
        userId: userPublicId,

        title: note
          ? `${note.title} Quiz`
          : topic
            ? `${topic} Quiz`
            : "AI Generated Quiz",

        description: note
          ? `AI-generated quiz based on ${note.title}.`
          : topic
            ? `AI-generated quiz about ${topic}.`
            : "AI-generated quiz.",

        generationMode,

        sourceNoteId: note?.publicId ?? null,
        sourceTopic: topic ?? null,

        requestedQuestionCount: questionCount,
        difficulty,

        generationStatus: "pending",
      })
      .returning({
        publicId: quizTable.publicId,
      });

    if (!quiz) {
      throw new AppError("Failed to create quiz.", 500);
    }

    try {
      await db
        .update(quizTable)
        .set({
          generationStatus: "processing",
          generationError: null,
          updatedAt: new Date(),
        })
        .where(eq(quizTable.publicId, quiz.publicId));

      const resolvedContext = note
        ? {
            content: note.content,
            source: "note" as const,
          }
        : await quizContextService.resolve({
            userPublicId,
            conversationId,
            topic,
            context,
          });

      if (!resolvedContext.content.trim()) {
        throw new AppError(
          "Unable to find enough context to generate the quiz.",
          400,
        );
      }

      const prompt = quizPrompt({
        context: resolvedContext.content,
        questionCount,
        difficulty,
      });

      const generatedQuiz = await generateQuizContent({
        prompt,
      });

      if (generatedQuiz.questions.length !== questionCount) {
        throw new AppError(
          `Gemini generated ${generatedQuiz.questions.length} questions instead of ${questionCount}.`,
          502,
        );
      }

      await db.transaction(async (tx) => {
        for (const generatedQuestion of generatedQuiz.questions) {
          const [createdQuestion] = await tx
            .insert(quizQuestionTable)
            .values({
              quizId: quiz.publicId,

              questionNumber: generatedQuestion.questionNumber,

              questionType: "multiple_choice",

              questionText: generatedQuestion.questionText,

              correctOptionNumber: generatedQuestion.correctOptionNumber,

              explanation: generatedQuestion.explanation,

              hint: generatedQuestion.hint,
            })
            .returning({
              publicId: quizQuestionTable.publicId,
            });

          if (!createdQuestion) {
            throw new AppError("Failed to create quiz question.", 500);
          }

          await tx.insert(quizOptionTable).values(
            generatedQuestion.options.map((option) => ({
              questionId: createdQuestion.publicId,

              optionNumber: option.optionNumber,

              optionText: option.optionText,
            })),
          );
        }

        await tx
          .update(quizTable)
          .set({
            generationStatus: "completed",
            generationError: null,
            generatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(quizTable.publicId, quiz.publicId));
      });

      const [completedQuiz] = await db
        .select({
          publicId: quizTable.publicId,
          title: quizTable.title,
          description: quizTable.description,

          generationMode: quizTable.generationMode,

          sourceNoteId: quizTable.sourceNoteId,
          sourceDocumentId: quizTable.sourceDocumentId,
          sourceTopic: quizTable.sourceTopic,

          requestedQuestionCount: quizTable.requestedQuestionCount,

          difficulty: quizTable.difficulty,

          generationStatus: quizTable.generationStatus,
          generationError: quizTable.generationError,

          generatedAt: quizTable.generatedAt,

          visibility: quizTable.visibility,

          createdAt: quizTable.createdAt,
          updatedAt: quizTable.updatedAt,
        })
        .from(quizTable)
        .where(eq(quizTable.publicId, quiz.publicId))
        .limit(1);

      if (!completedQuiz) {
        throw new AppError(
          "Quiz could not be retrieved after generation.",
          500,
        );
      }

      return completedQuiz;
    } catch (error) {
      const generationError =
        error instanceof AppError ? error.message : "Quiz generation failed.";

      await db
        .update(quizTable)
        .set({
          generationStatus: "failed",
          generationError,
          updatedAt: new Date(),
        })
        .where(eq(quizTable.publicId, quiz.publicId));

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Failed to generate quiz.",
        502,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async getByPublicId({
    userPublicId,
    quizPublicId,
  }: {
    userPublicId: string;
    quizPublicId: string;
  }) {
    const [quiz] = await db
      .select({
        publicId: quizTable.publicId,
        userId: quizTable.userId,
        title: quizTable.title,
        description: quizTable.description,
        generationMode: quizTable.generationMode,
        requestedQuestionCount: quizTable.requestedQuestionCount,
        difficulty: quizTable.difficulty,
        generationStatus: quizTable.generationStatus,
        visibility: quizTable.visibility,
        createdAt: quizTable.createdAt,
        updatedAt: quizTable.updatedAt,
      })
      .from(quizTable)
      .where(
        and(eq(quizTable.publicId, quizPublicId), isNull(quizTable.deletedAt)),
      )
      .limit(1);

    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    const isOwner = quiz.userId === userPublicId;

    if (!isOwner) {
      const [share] = await db
        .select({
          publicId: quizShareTable.publicId,
        })
        .from(quizShareTable)
        .where(
          and(
            eq(quizShareTable.quizId, quiz.publicId),
            eq(quizShareTable.recipientUserId, userPublicId),
            isNull(quizShareTable.revokedAt),
          ),
        )
        .limit(1);

      if (!share) {
        throw new AppError("Quiz not found.", 404);
      }
    }

    if (quiz.generationStatus !== "completed") {
      throw new AppError("Quiz is not available.", 409);
    }

    const questions = await db
      .select({
        publicId: quizQuestionTable.publicId,
        questionNumber: quizQuestionTable.questionNumber,
        questionType: quizQuestionTable.questionType,
        questionText: quizQuestionTable.questionText,

        optionPublicId: quizOptionTable.publicId,
        optionNumber: quizOptionTable.optionNumber,
        optionText: quizOptionTable.optionText,

        // These are only returned to the owner.
        correctOptionNumber: quizQuestionTable.correctOptionNumber,
        explanation: quizQuestionTable.explanation,
        hint: quizQuestionTable.hint,
      })
      .from(quizQuestionTable)
      .leftJoin(
        quizOptionTable,
        eq(quizOptionTable.questionId, quizQuestionTable.publicId),
      )
      .where(eq(quizQuestionTable.quizId, quiz.publicId))
      .orderBy(quizQuestionTable.questionNumber, quizOptionTable.optionNumber);

    if (questions.length === 0) {
      throw new AppError("Quiz does not contain any questions.", 409);
    }

    const questionMap = new Map<
      string,
      {
        publicId: string;
        questionNumber: number;
        questionType: "multiple_choice";
        questionText: string;
        options: {
          publicId: string;
          optionNumber: number;
          optionText: string;
        }[];

        correctOptionNumber?: number;
        explanation?: string | null;
        hint?: string | null;
      }
    >();

    for (const row of questions) {
      let question = questionMap.get(row.publicId);

      if (!question) {
        question = {
          publicId: row.publicId,
          questionNumber: row.questionNumber,
          questionType: row.questionType,
          questionText: row.questionText,
          options: [],
        };

        if (isOwner) {
          question.correctOptionNumber = row.correctOptionNumber;
          question.explanation = row.explanation;
          question.hint = row.hint;
        }

        questionMap.set(row.publicId, question);
      }

      if (row.optionPublicId) {
        question.options.push({
          publicId: row.optionPublicId,
          optionNumber: row.optionNumber!,
          optionText: row.optionText!,
        });
      }
    }

    const preparedQuestions = Array.from(questionMap.values());

    if (preparedQuestions.length !== quiz.requestedQuestionCount) {
      throw new AppError(
        "Quiz question count does not match the generated quiz.",
        409,
      );
    }

    return {
      quiz: {
        publicId: quiz.publicId,
        title: quiz.title,
        description: quiz.description,
        generationMode: quiz.generationMode,
        requestedQuestionCount: quiz.requestedQuestionCount,
        difficulty: quiz.difficulty,
        visibility: quiz.visibility,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      },
      questions: preparedQuestions,
    };
  }
  async startAttempt({
    userPublicId,
    quizPublicId,
  }: {
    userPublicId: string;
    quizPublicId: string;
  }) {
    // 1. Find the quiz
    const [quiz] = await db
      .select({
        publicId: quizTable.publicId,
        userId: quizTable.userId,
        generationStatus: quizTable.generationStatus,
        requestedQuestionCount: quizTable.requestedQuestionCount,
      })
      .from(quizTable)
      .where(
        and(eq(quizTable.publicId, quizPublicId), isNull(quizTable.deletedAt)),
      )
      .limit(1);

    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    // 2. Check whether requester is the owner
    const isOwner = quiz.userId === userPublicId;

    // 3. If not owner, check for an active share
    if (!isOwner) {
      const [share] = await db
        .select({
          publicId: quizShareTable.publicId,
        })
        .from(quizShareTable)
        .where(
          and(
            eq(quizShareTable.quizId, quiz.publicId),
            eq(quizShareTable.recipientUserId, userPublicId),
            isNull(quizShareTable.revokedAt),
          ),
        )
        .limit(1);

      if (!share) {
        throw new AppError("Quiz not found.", 404);
      }
    }

    // 4. Quiz must be completed
    if (quiz.generationStatus !== "completed") {
      throw new AppError("Quiz is not available for an attempt.", 409);
    }

    // 5. Get questions and options
    const questions = await db
      .select({
        publicId: quizQuestionTable.publicId,
        questionNumber: quizQuestionTable.questionNumber,
        questionType: quizQuestionTable.questionType,
        questionText: quizQuestionTable.questionText,

        optionPublicId: quizOptionTable.publicId,
        optionNumber: quizOptionTable.optionNumber,
        optionText: quizOptionTable.optionText,
      })
      .from(quizQuestionTable)
      .leftJoin(
        quizOptionTable,
        eq(quizOptionTable.questionId, quizQuestionTable.publicId),
      )
      .where(eq(quizQuestionTable.quizId, quiz.publicId))
      .orderBy(quizQuestionTable.questionNumber, quizOptionTable.optionNumber);

    if (questions.length === 0) {
      throw new AppError("Quiz does not contain any questions.", 409);
    }

    // 6. Group options under questions
    const questionMap = new Map<
      string,
      {
        publicId: string;
        questionNumber: number;
        questionType: "multiple_choice";
        questionText: string;
        options: {
          publicId: string;
          optionNumber: number;
          optionText: string;
        }[];
      }
    >();

    for (const row of questions) {
      let question = questionMap.get(row.publicId);

      if (!question) {
        question = {
          publicId: row.publicId,
          questionNumber: row.questionNumber,
          questionType: row.questionType,
          questionText: row.questionText,
          options: [],
        };

        questionMap.set(row.publicId, question);
      }

      if (row.optionPublicId) {
        question.options.push({
          publicId: row.optionPublicId,
          optionNumber: row.optionNumber!,
          optionText: row.optionText!,
        });
      }
    }

    const preparedQuestions = Array.from(questionMap.values());

    // 7. Verify question count
    if (preparedQuestions.length !== quiz.requestedQuestionCount) {
      throw new AppError(
        "Quiz question count does not match the generated quiz.",
        409,
      );
    }

    // 8. Create attempt for the requesting user
    const [attempt] = await db
      .insert(quizAttemptTable)
      .values({
        quizId: quiz.publicId,
        userId: userPublicId,
        status: "in_progress",
        totalQuestions: preparedQuestions.length,
      })
      .returning({
        publicId: quizAttemptTable.publicId,
        status: quizAttemptTable.status,
        startedAt: quizAttemptTable.startedAt,
        totalQuestions: quizAttemptTable.totalQuestions,
        createdAt: quizAttemptTable.createdAt,
      });

    if (!attempt) {
      throw new AppError("Failed to start quiz attempt.", 500);
    }

    return {
      ...attempt,
      quizPublicId: quiz.publicId,
      questions: preparedQuestions,
    };
  }

  async saveAnswer({
    userPublicId,
    attemptPublicId,
    questionPublicId,
    questionOptionId,
  }: {
    userPublicId: string;
    attemptPublicId: string;
    questionPublicId: string;
    questionOptionId: string;
  }) {
    const [attempt] = await db
      .select({
        publicId: quizAttemptTable.publicId,
        quizId: quizAttemptTable.quizId,
        status: quizAttemptTable.status,
      })
      .from(quizAttemptTable)
      .where(
        and(
          eq(quizAttemptTable.publicId, attemptPublicId),
          eq(quizAttemptTable.userId, userPublicId),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new AppError("Quiz attempt not found.", 404);
    }

    if (attempt.status !== "in_progress") {
      throw new AppError("This quiz attempt is no longer active.", 409);
    }

    const [question] = await db
      .select({
        publicId: quizQuestionTable.publicId,
        correctOptionNumber: quizQuestionTable.correctOptionNumber,
      })
      .from(quizQuestionTable)
      .where(
        and(
          eq(quizQuestionTable.publicId, questionPublicId),
          eq(quizQuestionTable.quizId, attempt.quizId),
        ),
      )
      .limit(1);

    if (!question) {
      throw new AppError("Question not found for this quiz attempt.", 404);
    }

    const [option] = await db
      .select({
        publicId: quizOptionTable.publicId,
        optionNumber: quizOptionTable.optionNumber,
      })
      .from(quizOptionTable)
      .where(
        and(
          eq(quizOptionTable.publicId, questionOptionId),
          eq(quizOptionTable.questionId, question.publicId),
        ),
      )
      .limit(1);

    if (!option) {
      throw new AppError(
        "Selected option does not belong to this question.",
        400,
      );
    }

    const isCorrect = option.optionNumber === question.correctOptionNumber;

    const [answer] = await db
      .insert(quizAnswerTable)
      .values({
        attemptId: attempt.publicId,
        questionId: question.publicId,
        questionOptionId: option.publicId,
        isCorrect,
      })
      .onConflictDoUpdate({
        target: [quizAnswerTable.attemptId, quizAnswerTable.questionId],
        set: {
          questionOptionId: option.publicId,
          isCorrect,
          updatedAt: new Date(),
        },
      })
      .returning({
        publicId: quizAnswerTable.publicId,
        attemptId: quizAnswerTable.attemptId,
        questionId: quizAnswerTable.questionId,
        questionOptionId: quizAnswerTable.questionOptionId,
        isCorrect: quizAnswerTable.isCorrect,
        updatedAt: quizAnswerTable.updatedAt,
      });

    if (!answer) {
      throw new AppError("Failed to save quiz answer.", 500);
    }

    return answer;
  }

  async submitAttempt({
    userPublicId,
    attemptPublicId,
  }: {
    userPublicId: string;
    attemptPublicId: string;
  }) {
    const [attempt] = await db
      .select({
        publicId: quizAttemptTable.publicId,
        quizId: quizAttemptTable.quizId,
        status: quizAttemptTable.status,
        totalQuestions: quizAttemptTable.totalQuestions,
      })
      .from(quizAttemptTable)
      .where(
        and(
          eq(quizAttemptTable.publicId, attemptPublicId),
          eq(quizAttemptTable.userId, userPublicId),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new AppError("Quiz attempt not found.", 404);
    }

    if (attempt.status !== "in_progress") {
      throw new AppError("This quiz attempt has already been submitted.", 409);
    }

    const questions = await db
      .select({
        publicId: quizQuestionTable.publicId,
      })
      .from(quizQuestionTable)
      .where(eq(quizQuestionTable.quizId, attempt.quizId));

    if (questions.length !== attempt.totalQuestions) {
      throw new AppError(
        "Quiz question count does not match the attempt.",
        409,
      );
    }

    const answers = await db
      .select({
        questionId: quizAnswerTable.questionId,
        isCorrect: quizAnswerTable.isCorrect,
      })
      .from(quizAnswerTable)
      .where(eq(quizAnswerTable.attemptId, attempt.publicId));

    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;

    const scorePercentage =
      attempt.totalQuestions > 0
        ? Number(((correctAnswers / attempt.totalQuestions) * 100).toFixed(2))
        : 0;

    const submittedAt = new Date();

    const [updatedAttempt] = await db
      .update(quizAttemptTable)
      .set({
        status: "submitted",
        submittedAt,
        score: correctAnswers,
        scorePercentage: scorePercentage.toString(),
        updatedAt: submittedAt,
      })
      .where(
        and(
          eq(quizAttemptTable.publicId, attempt.publicId),
          eq(quizAttemptTable.status, "in_progress"),
        ),
      )
      .returning({
        publicId: quizAttemptTable.publicId,
        status: quizAttemptTable.status,
        startedAt: quizAttemptTable.startedAt,
        submittedAt: quizAttemptTable.submittedAt,
        score: quizAttemptTable.score,
        totalQuestions: quizAttemptTable.totalQuestions,
        scorePercentage: quizAttemptTable.scorePercentage,
        createdAt: quizAttemptTable.createdAt,
        updatedAt: quizAttemptTable.updatedAt,
      });

    if (!updatedAttempt) {
      throw new AppError("Failed to submit quiz attempt.", 500);
    }

    return updatedAttempt;
  }

  async getQuizStats({
    userPublicId,
    quizPublicId,
  }: {
    userPublicId: string;
    quizPublicId: string;
  }) {
    const [quiz] = await db
      .select({
        publicId: quizTable.publicId,
        title: quizTable.title,
        requestedQuestionCount: quizTable.requestedQuestionCount,
      })
      .from(quizTable)
      .where(
        and(
          eq(quizTable.publicId, quizPublicId),
          eq(quizTable.userId, userPublicId),
          isNull(quizTable.deletedAt),
        ),
      )
      .limit(1);

    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    const attempts = await db
      .select({
        publicId: quizAttemptTable.publicId,
        score: quizAttemptTable.score,
        totalQuestions: quizAttemptTable.totalQuestions,
        scorePercentage: quizAttemptTable.scorePercentage,
        submittedAt: quizAttemptTable.submittedAt,
      })
      .from(quizAttemptTable)
      .where(
        and(
          eq(quizAttemptTable.quizId, quiz.publicId),
          eq(quizAttemptTable.userId, userPublicId),
          eq(quizAttemptTable.status, "submitted"),
        ),
      )
      .orderBy(quizAttemptTable.submittedAt);

    if (attempts.length === 0) {
      return {
        quizPublicId: quiz.publicId,
        title: quiz.title,
        totalAttempts: 0,
        bestScore: null,
        averageScore: null,
        bestPercentage: null,
        averagePercentage: null,
        latestAttempt: null,
        attemptHistory: [],
      };
    }

    const scores = attempts.map((attempt) => attempt.score ?? 0);

    const percentages = attempts.map((attempt) =>
      Number(attempt.scorePercentage ?? 0),
    );

    const bestScore = Math.max(...scores);

    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const bestPercentage = Math.max(...percentages);

    const averagePercentage =
      percentages.reduce((sum, percentage) => sum + percentage, 0) /
      percentages.length;

    const latest = attempts[attempts.length - 1];

    return {
      quizPublicId: quiz.publicId,
      title: quiz.title,

      totalAttempts: attempts.length,

      bestScore,

      averageScore: Number(averageScore.toFixed(2)),

      bestPercentage,

      averagePercentage: Number(averagePercentage.toFixed(2)),

      latestAttempt: {
        attemptPublicId: latest!.publicId,
        score: latest!.score,
        totalQuestions: latest!.totalQuestions,
        scorePercentage: Number(latest!.scorePercentage ?? 0),
        submittedAt: latest!.submittedAt,
      },

      attemptHistory: attempts.map((attempt, index) => ({
        attemptPublicId: attempt.publicId,
        attemptNumber: index + 1,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        scorePercentage: Number(attempt.scorePercentage ?? 0),
        submittedAt: attempt.submittedAt,
      })),
    };
  }

  async shareQuiz({
    userPublicId,
    quizPublicId,
    userHandle,
  }: {
    userPublicId: string;
    quizPublicId: string;
    userHandle: string;
  }) {
    // 1. Verify quiz ownership
    const [quiz] = await db
      .select({
        publicId: quizTable.publicId,
        title: quizTable.title,
      })
      .from(quizTable)
      .where(
        and(
          eq(quizTable.publicId, quizPublicId),
          eq(quizTable.userId, userPublicId),
          isNull(quizTable.deletedAt),
        ),
      )
      .limit(1);

    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    // 2. Find recipient
    const normalizedHandle = userHandle.trim().toLowerCase();

    const [recipient] = await db
      .select({
        publicId: userTable.publicId,
        userHandle: userTable.userHandle,
      })
      .from(userTable)
      .where(eq(userTable.userHandle, normalizedHandle))
      .limit(1);

    if (!recipient) {
      throw new AppError("Recipient user not found.", 404);
    }

    // 3. Prevent sharing with yourself
    if (recipient.publicId === userPublicId) {
      throw new AppError("You cannot share a quiz with yourself.", 400);
    }

    // 4. Check for an existing active share
    const [existingShare] = await db
      .select({
        publicId: quizShareTable.publicId,
      })
      .from(quizShareTable)
      .where(
        and(
          eq(quizShareTable.quizId, quiz.publicId),
          eq(quizShareTable.recipientUserId, recipient.publicId),
          isNull(quizShareTable.revokedAt),
        ),
      )
      .limit(1);

    if (existingShare) {
      throw new AppError("Quiz is already shared with this user.", 409);
    }

    // 5. Create share
    const [share] = await db
      .insert(quizShareTable)
      .values({
        quizId: quiz.publicId,
        recipientUserId: recipient.publicId,
      })
      .returning({
        publicId: quizShareTable.publicId,
        quizId: quizShareTable.quizId,
        recipientUserId: quizShareTable.recipientUserId,
        createdAt: quizShareTable.createdAt,
      });

    if (!share) {
      throw new AppError("Failed to share quiz.", 500);
    }

    return {
      sharePublicId: share.publicId,
      quizPublicId: share.quizId,
      quizTitle: quiz.title,
      recipient: {
        publicId: recipient.publicId,
        userHandle: recipient.userHandle,
      },
      createdAt: share.createdAt,
    };
  }

  async getSharedQuizzes({ userPublicId }: { userPublicId: string }) {
    const sharedQuizzes = await db
      .select({
        sharePublicId: quizShareTable.publicId,
        quizPublicId: quizTable.publicId,
        title: quizTable.title,
        description: quizTable.description,
        generationMode: quizTable.generationMode,
        requestedQuestionCount: quizTable.requestedQuestionCount,
        difficulty: quizTable.difficulty,
        visibility: quizTable.visibility,
        sharedAt: quizShareTable.createdAt,
      })
      .from(quizShareTable)
      .innerJoin(quizTable, eq(quizShareTable.quizId, quizTable.publicId))
      .where(
        and(
          eq(quizShareTable.recipientUserId, userPublicId),
          isNull(quizShareTable.revokedAt),
          isNull(quizTable.deletedAt),
          eq(quizTable.generationStatus, "completed"),
        ),
      )
      .orderBy(desc(quizShareTable.createdAt));

    return sharedQuizzes;
  }

  async revokeQuizShare({
    userPublicId,
    quizPublicId,
    sharePublicId,
  }: {
    userPublicId: string;
    quizPublicId: string;
    sharePublicId: string;
  }) {
    // Verify that the quiz belongs to the authenticated user.
    const [quiz] = await db
      .select({
        publicId: quizTable.publicId,
      })
      .from(quizTable)
      .where(
        and(
          eq(quizTable.publicId, quizPublicId),
          eq(quizTable.userId, userPublicId),
          isNull(quizTable.deletedAt),
        ),
      )
      .limit(1);

    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    // Revoke only an active share belonging to this quiz.
    const [share] = await db
      .update(quizShareTable)
      .set({
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(quizShareTable.publicId, sharePublicId),
          eq(quizShareTable.quizId, quiz.publicId),
          isNull(quizShareTable.revokedAt),
        ),
      )
      .returning({
        publicId: quizShareTable.publicId,
        quizId: quizShareTable.quizId,
        recipientUserId: quizShareTable.recipientUserId,
        createdAt: quizShareTable.createdAt,
        revokedAt: quizShareTable.revokedAt,
      });

    if (!share) {
      throw new AppError("Active quiz share not found.", 404);
    }

    return {
      sharePublicId: share.publicId,
      quizPublicId: share.quizId,
      recipientUserPublicId: share.recipientUserId,
      sharedAt: share.createdAt,
      revokedAt: share.revokedAt,
    };
  }

  async getQuizShares({
    userPublicId,
    quizPublicId,
  }: {
    userPublicId: string;
    quizPublicId: string;
  }) {
    // Verify that the quiz belongs to the authenticated user.
    const [quiz] = await db
      .select({
        publicId: quizTable.publicId,
        title: quizTable.title,
      })
      .from(quizTable)
      .where(
        and(
          eq(quizTable.publicId, quizPublicId),
          eq(quizTable.userId, userPublicId),
          isNull(quizTable.deletedAt),
        ),
      )
      .limit(1);

    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    const shares = await db
      .select({
        sharePublicId: quizShareTable.publicId,
        recipientPublicId: userTable.publicId,
        recipientUserHandle: userTable.userHandle,
        sharedAt: quizShareTable.createdAt,
        revokedAt: quizShareTable.revokedAt,
      })
      .from(quizShareTable)
      .innerJoin(
        userTable,
        eq(quizShareTable.recipientUserId, userTable.publicId),
      )
      .where(eq(quizShareTable.quizId, quiz.publicId))
      .orderBy(desc(quizShareTable.createdAt));

    return {
      quizPublicId: quiz.publicId,
      quizTitle: quiz.title,
      shares: shares.map((share) => ({
        sharePublicId: share.sharePublicId,
        recipient: {
          publicId: share.recipientPublicId,
          userHandle: share.recipientUserHandle,
        },
        sharedAt: share.sharedAt,
        revokedAt: share.revokedAt,
      })),
    };
  }
}

export default new QuizService();
