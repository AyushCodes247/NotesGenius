import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  loginUser,
  registerUser,
  refreshSession,
  type User,
} from "../api/userApi";

type UserState = {
  loading: boolean;
  isInitializing: boolean;
  authCheckStarted: boolean;
  user: User;
  accessToken: string;
  error: string | null;
};

const initialUser: User = {
  publicId: "",
  username: "",
  userhandle: "",
  email: "",
  createdAt: "",
};

const initialState: UserState = {
  loading: false,
  isInitializing: true,
  authCheckStarted: false,
  user: { ...initialUser },
  accessToken: "",
  error: null,
};

export const UserSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    profile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;

      if (action.payload) {
        state.error = null;
      }
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    logout: (state) => {
      state.loading = false;
      state.isInitializing = false;
      state.authCheckStarted = false;
      state.user = { ...initialUser };
      state.accessToken = "";
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Registration
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitializing = false;
        state.error = null;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isInitializing = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Registration failed. Please try again.";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitializing = false;
        state.error = null;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isInitializing = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Login failed. Please try again.";
      })

      // Restore session using the HTTP-only refresh-token cookie
      .addCase(refreshSession.pending, (state) => {
        state.authCheckStarted = true;
        state.isInitializing = true;
      })

      .addCase(refreshSession.fulfilled, (state, action) => {
        state.authCheckStarted = false;
        state.isInitializing = false;
        state.loading = false;
        state.error = null;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })

      .addCase(refreshSession.rejected, (state, action) => {
        state.authCheckStarted = false;
        state.isInitializing = false;
        state.loading = false;
        state.user = { ...initialUser };
        state.accessToken = "";

        // A missing or expired session is expected when logged out.
        // Don't display an initialization error on the login page.
        if (action.meta.aborted || action.meta.condition) {
          return;
        }

        state.error = null;
      });
  },
});

export const { profile, setLoading, setError, clearError, logout } =
  UserSlice.actions;

export default UserSlice.reducer;
