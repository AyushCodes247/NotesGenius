import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import api from "./api";
import type { RootState } from "../store/store";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type QuizDifficulty = "easy" | "medium" | "hard";

export type QuizGenerationMode = "note" | "topic";

export type QuizGenerationStatus = "pending" | "completed" | "failed";

export type QuizVisibility = "private" | "public";

export type QuizQuestionType = "multiple_choice";

export type Quiz = {
  publicId: string;
  title: string;
  description: string | null;
  generationMode: QuizGenerationMode;
  sourceNoteId: string | null;
  sourceDocumentId: string | null;
  sourceTopic: string | null;
  requestedQuestionCount: number;
  difficulty: QuizDifficulty;
  generationStatus: QuizGenerationStatus;
  generationError: string | null;
  generatedAt: string | null;
  visibility: QuizVisibility;
  createdAt: string;
  updatedAt: string;
};

export type QuizOption = {
  publicId: string;
  optionNumber: number;
  optionText: string;
};

export type QuizQuestion = {
  publicId: string;
  questionNumber: number;
  questionType: QuizQuestionType;
  questionText: string;
  options: QuizOption[];
  correctOptionNumber?: number;
  explanation?: string | null;
  hint?: string | null;
};

export type QuizDetails = {
  quiz: {
    publicId: string;
    title: string;
    description: string | null;
    generationMode: QuizGenerationMode;
    requestedQuestionCount: number;
    difficulty: QuizDifficulty;
    visibility: QuizVisibility;
    createdAt: string;
    updatedAt: string;
  };
  questions: QuizQuestion[];
};

export type AttemptQuestion = {
  publicId: string;
  questionNumber: number;
  questionType: QuizQuestionType;
  questionText: string;
  options: QuizOption[];
};

export type QuizAttempt = {
  publicId: string;
  status: "in_progress" | "submitted";
  startedAt: string;
  submittedAt: string | null;
  totalQuestions: number;
  score: number | null;
  scorePercentage: string | null;
  createdAt: string;
  updatedAt?: string;
  quizPublicId?: string;
  questions?: AttemptQuestion[];
};

export type SavedAnswer = {
  publicId: string;
  attemptId: string;
  questionId: string;
  questionOptionId: string;
  isCorrect: boolean;
  updatedAt: string;
};

export type QuizLatestAttempt = {
  attemptPublicId: string;
  score: number;
  totalQuestions: number;
  scorePercentage: string;
  submittedAt: string;
};

export type QuizAttemptHistory = {
  attemptPublicId: string;
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  scorePercentage: string;
  submittedAt: string;
};

export type QuizStats = {
  quizPublicId: string;
  title: string;
  totalAttempts: number;
  bestScore: number | null;
  averageScore: number | null;
  bestPercentage: number | null;
  averagePercentage: number | null;
  latestAttempt: QuizLatestAttempt | null;
  attemptHistory: QuizAttemptHistory[];
};

export type QuizShare = {
  sharePublicId: string;
  quizPublicId: string;
  quizTitle: string;
  recipient: {
    publicId: string;
    userHandle: string;
  };
  createdAt: string;
};

export type SharedQuiz = {
  sharePublicId: string;
  quizPublicId: string;
  title: string;
  description: string | null;
  generationMode: QuizGenerationMode;
  requestedQuestionCount: number;
  difficulty: QuizDifficulty;
  visibility: QuizVisibility;
  sharedAt: string;
};

export type QuizShareDetails = {
  quizPublicId: string;
  quizTitle: string;
  shares: {
    sharePublicId: string;
    recipient: {
      publicId: string;
      userHandle: string;
    };
    sharedAt: string;
    revokedAt: string | null;
  }[];
};

export type GenerateQuizPayload = {
  notesPublicId: string;
  questionCount: 5 | 10 | 15;
  difficulty: QuizDifficulty;
};

export type SaveAnswerPayload = {
  attemptPublicId: string;
  questionPublicId: string;
  questionOptionId: string;
};

export type ShareQuizPayload = {
  quizPublicId: string;
  userHandle: string;
};

export type RevokeQuizSharePayload = {
  quizPublicId: string;
  sharePublicId: string;
};

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const getAuthConfig = (accessToken: string | null) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ?? "Something went wrong. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
};

// --------------------------------------------------------------------------
// Generate quiz
// --------------------------------------------------------------------------

export const generateQuiz = createAsyncThunk<
  Quiz,
  GenerateQuizPayload,
  {
    rejectValue: string;
    state: RootState;
  }
>(
  "quiz/generate",
  async ({ notesPublicId, questionCount, difficulty }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();

      const response = await api.post(
        `/quizzes/${notesPublicId}`,
        {
          questionCount,
          difficulty,
        },
        getAuthConfig(state.user.accessToken),
      );

      return response.data.quiz;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// --------------------------------------------------------------------------
// Get quiz
// --------------------------------------------------------------------------

export const getQuiz = createAsyncThunk<
  QuizDetails,
  string,
  {
    rejectValue: string;
    state: RootState;
  }
>("quiz/get", async (quizPublicId, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const response = await api.get(
      `/quizzes/${quizPublicId}`,
      getAuthConfig(state.user.accessToken),
    );

    return response.data.quiz;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Start attempt
// --------------------------------------------------------------------------

export const startQuizAttempt = createAsyncThunk<
  QuizAttempt,
  string,
  {
    rejectValue: string;
    state: RootState;
  }
>("quiz/startAttempt", async (quizPublicId, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const response = await api.post(
      `/quizzes/${quizPublicId}/attempts`,
      {},
      getAuthConfig(state.user.accessToken),
    );

    return response.data.attempt;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Save answer
// --------------------------------------------------------------------------

export const saveQuizAnswer = createAsyncThunk<
  SavedAnswer,
  SaveAnswerPayload,
  {
    rejectValue: string;
    state: RootState;
  }
>(
  "quiz/saveAnswer",
  async ({ attemptPublicId, questionPublicId, questionOptionId }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();

      const response = await api.put(
        `/quizzes/attempts/${attemptPublicId}/answers/${questionPublicId}`,
        {
          questionOptionId,
        },
        getAuthConfig(state.user.accessToken),
      );

      return response.data.answer;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// --------------------------------------------------------------------------
// Submit attempt
// --------------------------------------------------------------------------

export const submitQuizAttempt = createAsyncThunk<
  QuizAttempt,
  string,
  {
    rejectValue: string;
    state: RootState;
  }
>("quiz/submitAttempt", async (attemptPublicId, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const response = await api.post(
      `/quizzes/attempts/${attemptPublicId}/submit`,
      {},
      getAuthConfig(state.user.accessToken),
    );

    return response.data.attempt;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Get quiz stats / analytics
// --------------------------------------------------------------------------

export const getQuizStats = createAsyncThunk<
  QuizStats,
  string,
  {
    rejectValue: string;
    state: RootState;
  }
>("quiz/getStats", async (quizPublicId, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const response = await api.get(
      `/quizzes/${quizPublicId}/stats`,
      getAuthConfig(state.user.accessToken),
    );

    return response.data.stats;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Share quiz
// --------------------------------------------------------------------------

export const shareQuiz = createAsyncThunk<
  QuizShare,
  ShareQuizPayload,
  {
    rejectValue: string;
    state: RootState;
  }
>("quiz/share", async ({ quizPublicId, userHandle }, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const response = await api.post(
      `/quizzes/${quizPublicId}/share`,
      {
        userHandle,
      },
      getAuthConfig(state.user.accessToken),
    );

    return response.data.share;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Get shared quizzes
// --------------------------------------------------------------------------

export const getSharedQuizzes = createAsyncThunk<
  SharedQuiz[],
  void,
  {
    rejectValue: string;
    state: RootState;
  }
>("quiz/getShared", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const response = await api.get(
      "/quizzes/shared",
      getAuthConfig(state.user.accessToken),
    );

    return response.data.quizzes;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Get quiz shares
// --------------------------------------------------------------------------

export const getQuizShares = createAsyncThunk<
  QuizShareDetails,
  string,
  {
    rejectValue: string;
    state: RootState;
  }
>("quiz/getShares", async (quizPublicId, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const response = await api.get(
      `/quizzes/${quizPublicId}/shares`,
      getAuthConfig(state.user.accessToken),
    );

    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Revoke quiz share
// --------------------------------------------------------------------------

export const revokeQuizShare = createAsyncThunk<
  {
    sharePublicId: string;
    quizPublicId: string;
    recipientUserPublicId: string;
    sharedAt: string;
    revokedAt: string;
  },
  RevokeQuizSharePayload,
  {
    rejectValue: string;
    state: RootState;
  }
>("quiz/revokeShare", async ({ quizPublicId, sharePublicId }, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const response = await api.delete(
      `/quizzes/${quizPublicId}/share/${sharePublicId}`,
      getAuthConfig(state.user.accessToken),
    );

    return response.data.share;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});
