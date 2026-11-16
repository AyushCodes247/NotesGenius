import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  createNote,
  deleteNote,
  discussNote,
  getAllNotes,
  getOneNote,
  getSharedNotes,
  revokeNoteShare,
  shareNote,
  updateNote,
  uploadNote,
  type DiscussionResult,
  type Note,
  type SharedNote,
} from "../api/notesApi";

type DiscussionState = {
  conversationId: string;

  messages: {
    role: "user" | "assistant";
    content: string;
  }[];

  sources: DiscussionResult["sources"] | null;

  messageCount: number;
};

type NotesState = {
  notes: Note[];

  sharedNotes: SharedNote[];

  currentNote: Note | null;

  discussion: DiscussionState;

  loading: boolean;
  loadingNotes: boolean;
  loadingShared: boolean;
  loadingNote: boolean;

  creating: boolean;
  uploading: boolean;
  discussing: boolean;
  updating: boolean;
  deleting: boolean;
  sharing: boolean;

  error: string | null;
};

const initialDiscussionState: DiscussionState = {
  conversationId: "",
  messages: [],
  sources: null,
  messageCount: 0,
};

const initialState: NotesState = {
  notes: [],
  sharedNotes: [],

  currentNote: null,

  discussion: initialDiscussionState,

  loading: false,
  loadingNotes: false,
  loadingShared: false,
  loadingNote: false,

  creating: false,
  uploading: false,
  discussing: false,
  updating: false,
  deleting: false,
  sharing: false,

  error: null,
};

export const NotesSlice = createSlice({
  name: "notes",

  initialState,

  reducers: {
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

    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },

    clearCurrentNote: (state) => {
      state.currentNote = null;
      state.discussion = {
        ...initialDiscussionState,
        messages: [],
      };
    },

    clearDiscussion: (state) => {
      state.discussion = {
        ...initialDiscussionState,
        messages: [],
      };
    },

    setDiscussionConversation: (state, action: PayloadAction<string>) => {
      state.discussion.conversationId = action.payload;
    },

    addDiscussionMessage: (
      state,
      action: PayloadAction<{
        role: "user" | "assistant";
        content: string;
      }>,
    ) => {
      state.discussion.messages.push(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder

      /* ------------------------------------------------------------------ */
      /*                              Create                                */
      /* ------------------------------------------------------------------ */

      .addCase(createNote.pending, (state) => {
        state.creating = true;
        state.error = null;
      })

      .addCase(createNote.fulfilled, (state, action) => {
        state.creating = false;
        state.error = null;

        const newNote: Note = {
          publicId: action.payload.publicId,
          title: action.payload.title,
          content: "",
          sourceText: null,
          topic: null,
          visibility: action.payload.visibility,
          pdfUrl: null,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
        };

        state.notes = [
          newNote,
          ...state.notes.filter((note) => note.publicId !== newNote.publicId),
        ];

        state.currentNote = newNote;
      })

      .addCase(createNote.rejected, (state, action) => {
        state.creating = false;

        state.error =
          action.payload ?? action.error.message ?? "Failed to create note.";
      })

      /* ------------------------------------------------------------------ */
      /*                               Upload                               */
      /* ------------------------------------------------------------------ */

      .addCase(uploadNote.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })

      .addCase(uploadNote.fulfilled, (state, action) => {
        state.uploading = false;
        state.error = null;

        const uploaded = action.payload;

        const updatedNote = state.notes.find(
          (note) => note.publicId === uploaded.public_id,
        );

        if (updatedNote) {
          updatedNote.title = uploaded.title;
          updatedNote.visibility = uploaded.visibility;
          updatedNote.createdAt = uploaded.created_at;
          updatedNote.updatedAt = uploaded.created_at;
        }

        if (
          state.currentNote &&
          state.currentNote.publicId === uploaded.public_id
        ) {
          state.currentNote.title = uploaded.title;
          state.currentNote.visibility = uploaded.visibility;
          state.currentNote.createdAt = uploaded.created_at;
          state.currentNote.updatedAt = uploaded.created_at;
        }
      })

      .addCase(uploadNote.rejected, (state, action) => {
        state.uploading = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to upload the document.";
      })

      /* ------------------------------------------------------------------ */
      /*                              Get All                               */
      /* ------------------------------------------------------------------ */

      .addCase(getAllNotes.pending, (state) => {
        state.loadingNotes = true;
        state.error = null;
      })

      .addCase(getAllNotes.fulfilled, (state, action) => {
        state.loadingNotes = false;
        state.error = null;

        state.notes = action.payload;
      })

      .addCase(getAllNotes.rejected, (state, action) => {
        state.loadingNotes = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load your notes.";
      })

      /* ------------------------------------------------------------------ */
      /*                            Get Shared                              */
      /* ------------------------------------------------------------------ */

      .addCase(getSharedNotes.pending, (state) => {
        state.loadingShared = true;
        state.error = null;
      })

      .addCase(getSharedNotes.fulfilled, (state, action) => {
        state.loadingShared = false;
        state.error = null;

        state.sharedNotes = action.payload;
      })

      .addCase(getSharedNotes.rejected, (state, action) => {
        state.loadingShared = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load shared notes.";
      })

      /* ------------------------------------------------------------------ */
      /*                              Get One                               */
      /* ------------------------------------------------------------------ */

      .addCase(getOneNote.pending, (state) => {
        state.loadingNote = true;
        state.error = null;
      })

      .addCase(getOneNote.fulfilled, (state, action) => {
        state.loadingNote = false;
        state.error = null;

        state.currentNote = action.payload;

        const index = state.notes.findIndex(
          (note) => note.publicId === action.payload.publicId,
        );

        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })

      .addCase(getOneNote.rejected, (state, action) => {
        state.loadingNote = false;

        state.error =
          action.payload ?? action.error.message ?? "Failed to load the note.";
      })

      /* ------------------------------------------------------------------ */
      /*                              Update                                */
      /* ------------------------------------------------------------------ */

      .addCase(updateNote.pending, (state) => {
        state.updating = true;
        state.error = null;
      })

      .addCase(updateNote.fulfilled, (state, action) => {
        state.updating = false;
        state.error = null;

        state.currentNote = action.payload;

        const index = state.notes.findIndex(
          (note) => note.publicId === action.payload.publicId,
        );

        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })

      .addCase(updateNote.rejected, (state, action) => {
        state.updating = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to update the note.";
      })

      /* ------------------------------------------------------------------ */
      /*                              Delete                                */
      /* ------------------------------------------------------------------ */

      .addCase(deleteNote.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })

      .addCase(deleteNote.fulfilled, (state, action) => {
        state.deleting = false;
        state.error = null;

        state.notes = state.notes.filter(
          (note) => note.publicId !== action.payload,
        );

        state.sharedNotes = state.sharedNotes.filter(
          (note) => note.publicId !== action.payload,
        );

        if (state.currentNote?.publicId === action.payload) {
          state.currentNote = null;

          state.discussion = {
            ...initialDiscussionState,
            messages: [],
          };
        }
      })

      .addCase(deleteNote.rejected, (state, action) => {
        state.deleting = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to delete the note.";
      })

      /* ------------------------------------------------------------------ */
      /*                              Discuss                               */
      /* ------------------------------------------------------------------ */

      .addCase(discussNote.pending, (state) => {
        state.discussing = true;
        state.error = null;
      })

      .addCase(discussNote.fulfilled, (state, action) => {
        state.discussing = false;
        state.error = null;

        const result = action.payload;

        state.discussion.conversationId = result.conversationId;

        state.discussion.messages.push({
          role: "assistant",
          content: result.response,
        });

        state.discussion.sources = result.sources;

        state.discussion.messageCount = result.messageCount;

        if (result.pdf.url && state.currentNote) {
          state.currentNote.pdfUrl = result.pdf.url;
        }
      })

      .addCase(discussNote.rejected, (state, action) => {
        state.discussing = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to generate an AI response.";
      })

      /* ------------------------------------------------------------------ */
      /*                                Share                               */
      /* ------------------------------------------------------------------ */

      .addCase(shareNote.pending, (state) => {
        state.sharing = true;
        state.error = null;
      })

      .addCase(shareNote.fulfilled, (state) => {
        state.sharing = false;
        state.error = null;
      })

      .addCase(shareNote.rejected, (state, action) => {
        state.sharing = false;

        state.error =
          action.payload ?? action.error.message ?? "Failed to share the note.";
      })

      /* ------------------------------------------------------------------ */
      /*                           Revoke Share                             */
      /* ------------------------------------------------------------------ */

      .addCase(revokeNoteShare.pending, (state) => {
        state.sharing = true;
        state.error = null;
      })

      .addCase(revokeNoteShare.fulfilled, (state) => {
        state.sharing = false;
        state.error = null;
      })

      .addCase(revokeNoteShare.rejected, (state, action) => {
        state.sharing = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to revoke note sharing.";
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setCurrentNote,
  clearCurrentNote,
  clearDiscussion,
  setDiscussionConversation,
  addDiscussionMessage,
} = NotesSlice.actions;

export default NotesSlice.reducer;
