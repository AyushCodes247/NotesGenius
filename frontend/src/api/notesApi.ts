import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import api from "./api";
import type { RootState } from "../store/store";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type NoteVisibility = "private" | "public";

export type Note = {
  publicId: string;
  title: string;
  content: string;
  sourceText: string | null;
  topic: string | null;
  visibility: NoteVisibility;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NoteSummary = {
  publicId: string;
  title: string;
  visibility: NoteVisibility;
  createdAt: string;
  updatedAt: string;
};

export type SharedNote = Note & {
  sharePublicId: string;
  sharedAt: string;
};

export type CreateNoteInput = {
  title: string;
};

export type UploadNoteInput = {
  notesPublicId: string;
  file: File;
};

export type UpdateNoteInput = {
  notesPublicId: string;
  title?: string;
  visibility?: NoteVisibility;
  topic?: string | null;
};

export type DiscussNoteInput = {
  notesPublicId: string;
  command: string;
  query: string;
  conversationId?: string;
};

export type ShareNoteInput = {
  notesPublicId: string;
  userHandle: string;
};

export type RevokeShareInput = {
  notesPublicId: string;
  sharePublicId: string;
};

export type UploadSource = {
  file_public_id: string;
  filename: string;
  processing_status: string;
};

export type UploadNoteResponse = {
  note: Note;
};

export type DiscussionSource =
  | {
      type: "document";
      documentPublicId: string;
    }
  | {
      type: "web";
      results: {
        title: string;
        url: string;
        favicon?: string;
      }[];
    };

export type DiscussionResult = {
  conversationId: string;

  note: {
    publicId: string;
    title: string;
  };

  response: string;

  pdf: {
    storageKey: string;
    url: string;
  };

  sources: DiscussionSource;

  messageCount: number;
};

export type NoteShare = {
  publicId: string;
  noteId: string;
  pdfUrl: string | null;
  recipientUserId: string;
  createdAt: string;
  revokedAt: string | null;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  note?: T;
  notes?: T;
  result?: T;
  share?: T;
};

// --------------------------------------------------------------------------
// Authenticated request
// --------------------------------------------------------------------------

const getAuthConfig = (state: RootState) => {
  const accessToken = state.user.accessToken;

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

// --------------------------------------------------------------------------
// Error handling
// --------------------------------------------------------------------------

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

// --------------------------------------------------------------------------
// Create Note
// --------------------------------------------------------------------------

export const createNote = createAsyncThunk<
  NoteSummary,
  CreateNoteInput,
  { rejectValue: string; state: RootState }
>("notes/create", async (payload, { rejectWithValue, getState }) => {
  try {
    const { data } = await api.post<ApiResponse<NoteSummary>>(
      "/notes",
      payload,
      getAuthConfig(getState()),
    );

    if (!data.note) {
      return rejectWithValue("Note was created but no note was returned.");
    }

    return data.note;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Upload
// --------------------------------------------------------------------------

export const uploadNote = createAsyncThunk<
  Note,
  UploadNoteInput,
  { rejectValue: string; state: RootState }
>("notes/upload", async (payload, { rejectWithValue, getState }) => {
  try {
    const { notesPublicId, file } = payload;

    const formData = new FormData();

    formData.append("document", file);

    const { data } = await api.post<ApiResponse<UploadNoteResponse>>(
      `/notes/${notesPublicId}/upload`,
      formData,
      getAuthConfig(getState()),
    );

    if (!data.data?.note) {
      return rejectWithValue(
        data.message || "Failed to upload study material.",
      );
    }

    return data.data.note;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Get All Notes
// --------------------------------------------------------------------------

export const getAllNotes = createAsyncThunk<
  Note[],
  void,
  { rejectValue: string; state: RootState }
>("notes/getAll", async (_, { rejectWithValue, getState }) => {
  try {
    const { data } = await api.get<ApiResponse<Note[]>>(
      "/notes/all",
      getAuthConfig(getState()),
    );

    return data.data ?? [];
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Get Shared Notes
// --------------------------------------------------------------------------

export const getSharedNotes = createAsyncThunk<
  SharedNote[],
  void,
  { rejectValue: string; state: RootState }
>("notes/getShared", async (_, { rejectWithValue, getState }) => {
  try {
    const { data } = await api.get<ApiResponse<SharedNote[]>>(
      "/notes/shared",
      getAuthConfig(getState()),
    );

    return data.notes ?? [];
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Get One Note
// --------------------------------------------------------------------------

export const getOneNote = createAsyncThunk<
  Note,
  string,
  { rejectValue: string; state: RootState }
>("notes/getOne", async (notesPublicId, { rejectWithValue, getState }) => {
  try {
    const { data } = await api.get<ApiResponse<Note>>(
      `/notes/${notesPublicId}/one`,
      getAuthConfig(getState()),
    );

    if (!data.note) {
      return rejectWithValue("Note was not returned by the server.");
    }

    return data.note;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Update
// --------------------------------------------------------------------------

export const updateNote = createAsyncThunk<
  Note,
  UpdateNoteInput,
  { rejectValue: string; state: RootState }
>(
  "notes/update",
  async ({ notesPublicId, ...payload }, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.patch<ApiResponse<Note>>(
        `/notes/${notesPublicId}`,
        payload,
        getAuthConfig(getState()),
      );

      if (!data.note) {
        return rejectWithValue("Updated note was not returned by the server.");
      }

      return data.note;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// --------------------------------------------------------------------------
// Delete
// --------------------------------------------------------------------------

export const deleteNote = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("notes/delete", async (notesPublicId, { rejectWithValue, getState }) => {
  try {
    await api.delete(`/notes/${notesPublicId}`, getAuthConfig(getState()));

    return notesPublicId;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// --------------------------------------------------------------------------
// Discuss
// --------------------------------------------------------------------------

export const discussNote = createAsyncThunk<
  DiscussionResult,
  DiscussNoteInput,
  { rejectValue: string; state: RootState }
>(
  "notes/discuss",
  async (
    { notesPublicId, command, query, conversationId },
    { rejectWithValue, getState },
  ) => {
    try {
      const { data } = await api.post<ApiResponse<DiscussionResult>>(
        `/notes/${notesPublicId}`,
        {
          command,
          query,
          ...(conversationId ? { conversationId } : {}),
        },
        getAuthConfig(getState()),
      );

      if (!data.result) {
        return rejectWithValue(
          "The AI response was generated but no result was returned.",
        );
      }

      return data.result;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// --------------------------------------------------------------------------
// Share
// --------------------------------------------------------------------------

export const shareNote = createAsyncThunk<
  NoteShare,
  ShareNoteInput,
  { rejectValue: string; state: RootState }
>(
  "notes/share",
  async ({ notesPublicId, userHandle }, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.post<ApiResponse<NoteShare>>(
        `/notes/${notesPublicId}/share`,
        {
          userHandle: userHandle.trim().toLowerCase(),
        },
        getAuthConfig(getState()),
      );

      if (!data.share) {
        return rejectWithValue("Note was shared but no share was returned.");
      }

      return data.share;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// --------------------------------------------------------------------------
// Revoke Share
// --------------------------------------------------------------------------

export const revokeNoteShare = createAsyncThunk<
  string,
  RevokeShareInput,
  { rejectValue: string; state: RootState }
>(
  "notes/revokeShare",
  async ({ notesPublicId, sharePublicId }, { rejectWithValue, getState }) => {
    try {
      await api.delete(
        `/notes/${notesPublicId}/share/${sharePublicId}`,
        getAuthConfig(getState()),
      );

      return sharePublicId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
