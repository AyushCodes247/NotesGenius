import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  generateQuiz,
  getQuiz,
  startQuizAttempt,
  saveQuizAnswer,
  submitQuizAttempt,
  getQuizStats,
  shareQuiz,
  getSharedQuizzes,
  getQuizShares,
  revokeQuizShare,
  type Quiz,
  type QuizDetails,
  type QuizAttempt,
  type SavedAnswer,
  type QuizStats,
  type QuizShare,
  type SharedQuiz,
  type QuizShareDetails,
} from "../api/quizApi";

// --------------------------------------------------------------------------
// State
// --------------------------------------------------------------------------

type QuizState = {
  quizzes: Quiz[];

  currentQuiz: QuizDetails | null;

  currentAttempt: QuizAttempt | null;

  savedAnswers: Record<string, SavedAnswer>;

  stats: QuizStats | null;

  sharedQuizzes: SharedQuiz[];

  quizShares: QuizShareDetails | null;

  loading: boolean;

  loadingQuiz: boolean;

  generating: boolean;

  startingAttempt: boolean;

  savingAnswer: boolean;

  submittingAttempt: boolean;

  loadingStats: boolean;

  sharing: boolean;

  loadingShared: boolean;

  loadingShares: boolean;

  revokingShare: boolean;

  error: string | null;
};

// --------------------------------------------------------------------------
// Initial state
// --------------------------------------------------------------------------

const initialState: QuizState = {
  quizzes: [],

  currentQuiz: null,

  currentAttempt: null,

  savedAnswers: {},

  stats: null,

  sharedQuizzes: [],

  quizShares: null,

  loading: false,

  loadingQuiz: false,

  generating: false,

  startingAttempt: false,

  savingAnswer: false,

  submittingAttempt: false,

  loadingStats: false,

  sharing: false,

  loadingShared: false,

  loadingShares: false,

  revokingShare: false,

  error: null,
};

// --------------------------------------------------------------------------
// Slice
// --------------------------------------------------------------------------

const quizSlice = createSlice({
  name: "quiz",

  initialState,

  reducers: {
    clearQuizError: (state) => {
      state.error = null;
    },

    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },

    clearCurrentAttempt: (state) => {
      state.currentAttempt = null;
      state.savedAnswers = {};
    },

    clearQuizStats: (state) => {
      state.stats = null;
    },

    clearQuizShares: (state) => {
      state.quizShares = null;
    },

    clearQuizState: (state) => {
      state.quizzes = [];
      state.currentQuiz = null;
      state.currentAttempt = null;
      state.savedAnswers = {};
      state.stats = null;
      state.sharedQuizzes = [];
      state.quizShares = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ----------------------------------------------------------------------
    // Generate quiz
    // ----------------------------------------------------------------------

    builder
      .addCase(generateQuiz.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateQuiz.fulfilled, (state, action: PayloadAction<Quiz>) => {
        state.generating = false;
        state.quizzes.unshift(action.payload);
      })
      .addCase(generateQuiz.rejected, (state, action) => {
        state.generating = false;
        state.error =
          action.payload ?? action.error.message ?? "Unable to generate quiz.";
      });

    // ----------------------------------------------------------------------
    // Get quiz
    // ----------------------------------------------------------------------

    builder
      .addCase(getQuiz.pending, (state) => {
        state.loadingQuiz = true;
        state.error = null;
      })
      .addCase(
        getQuiz.fulfilled,
        (state, action: PayloadAction<QuizDetails>) => {
          state.loadingQuiz = false;
          state.currentQuiz = action.payload;
        },
      )
      .addCase(getQuiz.rejected, (state, action) => {
        state.loadingQuiz = false;
        state.error =
          action.payload ?? action.error.message ?? "Unable to load quiz.";
      });

    // ----------------------------------------------------------------------
    // Start attempt
    // ----------------------------------------------------------------------

    builder
      .addCase(startQuizAttempt.pending, (state) => {
        state.startingAttempt = true;
        state.error = null;
        state.savedAnswers = {};
      })
      .addCase(
        startQuizAttempt.fulfilled,
        (state, action: PayloadAction<QuizAttempt>) => {
          state.startingAttempt = false;
          state.currentAttempt = action.payload;
          state.savedAnswers = {};
        },
      )
      .addCase(startQuizAttempt.rejected, (state, action) => {
        state.startingAttempt = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to start quiz attempt.";
      });

    // ----------------------------------------------------------------------
    // Save answer
    // ----------------------------------------------------------------------

    builder
      .addCase(saveQuizAnswer.pending, (state) => {
        state.savingAnswer = true;
        state.error = null;
      })
      .addCase(
        saveQuizAnswer.fulfilled,
        (state, action: PayloadAction<SavedAnswer>) => {
          state.savingAnswer = false;

          state.savedAnswers[action.payload.questionId] = action.payload;
        },
      )
      .addCase(saveQuizAnswer.rejected, (state, action) => {
        state.savingAnswer = false;
        state.error =
          action.payload ?? action.error.message ?? "Unable to save answer.";
      });

    // ----------------------------------------------------------------------
    // Submit attempt
    // ----------------------------------------------------------------------

    builder
      .addCase(submitQuizAttempt.pending, (state) => {
        state.submittingAttempt = true;
        state.error = null;
      })
      .addCase(
        submitQuizAttempt.fulfilled,
        (state, action: PayloadAction<QuizAttempt>) => {
          state.submittingAttempt = false;
          state.currentAttempt = action.payload;
        },
      )
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.submittingAttempt = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to submit quiz attempt.";
      });

    // ----------------------------------------------------------------------
    // Quiz stats / analytics
    // ----------------------------------------------------------------------

    builder
      .addCase(getQuizStats.pending, (state) => {
        state.loadingStats = true;
        state.error = null;
      })
      .addCase(
        getQuizStats.fulfilled,
        (state, action: PayloadAction<QuizStats>) => {
          state.loadingStats = false;
          state.stats = action.payload;
        },
      )
      .addCase(getQuizStats.rejected, (state, action) => {
        state.loadingStats = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to load quiz analytics.";
      });

    // ----------------------------------------------------------------------
    // Share quiz
    // ----------------------------------------------------------------------

    builder
      .addCase(shareQuiz.pending, (state) => {
        state.sharing = true;
        state.error = null;
      })
      .addCase(
        shareQuiz.fulfilled,
        (state, action: PayloadAction<QuizShare>) => {
          state.sharing = false;

          if (state.quizShares) {
            state.quizShares.shares.push({
              sharePublicId: action.payload.sharePublicId,
              recipient: action.payload.recipient,
              sharedAt: action.payload.createdAt,
              revokedAt: null,
            });
          }
        },
      )
      .addCase(shareQuiz.rejected, (state, action) => {
        state.sharing = false;
        state.error =
          action.payload ?? action.error.message ?? "Unable to share quiz.";
      });

    // ----------------------------------------------------------------------
    // Get shared quizzes
    // ----------------------------------------------------------------------

    builder
      .addCase(getSharedQuizzes.pending, (state) => {
        state.loadingShared = true;
        state.error = null;
      })
      .addCase(
        getSharedQuizzes.fulfilled,
        (state, action: PayloadAction<SharedQuiz[]>) => {
          state.loadingShared = false;
          state.sharedQuizzes = action.payload;
        },
      )
      .addCase(getSharedQuizzes.rejected, (state, action) => {
        state.loadingShared = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to load shared quizzes.";
      });

    // ----------------------------------------------------------------------
    // Get quiz shares
    // ----------------------------------------------------------------------

    builder
      .addCase(getQuizShares.pending, (state) => {
        state.loadingShares = true;
        state.error = null;
      })
      .addCase(
        getQuizShares.fulfilled,
        (state, action: PayloadAction<QuizShareDetails>) => {
          state.loadingShares = false;
          state.quizShares = action.payload;
        },
      )
      .addCase(getQuizShares.rejected, (state, action) => {
        state.loadingShares = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to load quiz shares.";
      });

    // ----------------------------------------------------------------------
    // Revoke quiz share
    // ----------------------------------------------------------------------

    builder
      .addCase(revokeQuizShare.pending, (state) => {
        state.revokingShare = true;
        state.error = null;
      })
      .addCase(
        revokeQuizShare.fulfilled,
        (
          state,
          action: PayloadAction<{
            sharePublicId: string;
            quizPublicId: string;
            recipientUserPublicId: string;
            sharedAt: string;
            revokedAt: string;
          }>,
        ) => {
          state.revokingShare = false;

          if (state.quizShares) {
            state.quizShares.shares = state.quizShares.shares.map((share) =>
              share.sharePublicId === action.payload.sharePublicId
                ? {
                    ...share,
                    revokedAt: action.payload.revokedAt,
                  }
                : share,
            );
          }
        },
      )
      .addCase(revokeQuizShare.rejected, (state, action) => {
        state.revokingShare = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to revoke quiz share.";
      });
  },
});

export const {
  clearQuizError,
  clearCurrentQuiz,
  clearCurrentAttempt,
  clearQuizStats,
  clearQuizShares,
  clearQuizState,
} = quizSlice.actions;

export default quizSlice.reducer;
