import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "./api";
import type { RootState } from "../store/store";

export type User = {
  publicId: string;
  username: string;
  email: string;
  createdAt: string;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return "Unable to connect to the server. Please try again.";
    }

    return (
      error.response.data?.message ??
      error.response.data?.error ??
      "The request failed. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
}

export const registerUser = createAsyncThunk<
  AuthPayload,
  RegisterInput,
  { rejectValue: string }
>("user/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<AuthResponse>("/users/register", payload);

    return {
      user: data.user,
      accessToken: data.accessToken,
    };
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const loginUser = createAsyncThunk<
  AuthPayload,
  LoginInput,
  { rejectValue: string }
>("user/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<AuthResponse>("/users/login", payload);

    return {
      user: data.user,
      accessToken: data.accessToken,
    };
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const refreshSession = createAsyncThunk<
  AuthPayload,
  void,
  { rejectValue: string; state: RootState }
>(
  "user/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>("/users/refresh");

      return {
        user: data.user,
        accessToken: data.accessToken,
      };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      return !getState().user.authCheckStarted;
    },
  },
);