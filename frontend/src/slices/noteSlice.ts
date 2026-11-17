import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  createNote,
  deleteNote,
  discussNote,
  getAllNotes,
  getConversation,
  getOneNote,
  getSharedByMe,
  getSharedNotes,
  revokeNoteShare,
  shareNote,
  updateNote,
  uploadNote,
  type DiscussionResult,
  type Note,
  type NoteSummary,
  type SharedByMe,
  type SharedNote,
} from "../api/notesApi";

type DiscussionMessage = {
  role: "user" | "assistant";
  content: string;
  sources: DiscussionResult["sources"] | null;
};

type DiscussionState = {
  conversationId: string;
  messages: DiscussionMessage[];
  messageCount: number;
};

type NotesState = {
  notes: NoteSummary[];

  sharedNotes: SharedNote[];
  sharedByMe: SharedByMe[];

  currentNote: Note | null;

  discussion: DiscussionState;

  loading: boolean;
  loadingNotes: boolean;
  loadingShared: boolean;
  loadingSharedByMe: boolean;
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
  messageCount: 0,
};

const initialState: NotesState = {
  notes: [],
  sharedNotes: [],
  sharedByMe: [],

  currentNote: null,

  discussion: initialDiscussionState,

  loading: false,
  loadingNotes: false,
  loadingShared: false,
  loadingSharedByMe: false,
  loadingNote: false,

  creating: false,
  uploading: false,
  discussing: false,
  updating: false,
  deleting: false,
  sharing: false,

  error: null,
};

const NotesSlice = createSlice({
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
        sources?: DiscussionResult["sources"] | null;
      }>,
    ) => {
      state.discussion.messages.push({
        role: action.payload.role,
        content: action.payload.content,
        sources: action.payload.sources ?? null,
      });
    },

    hydrateDiscussion: (
      state,
      action: PayloadAction<{
        conversationId: string;
        messages: DiscussionMessage[];
        messageCount: number;
      }>,
    ) => {
      state.discussion.conversationId = action.payload.conversationId;

      state.discussion.messages = action.payload.messages;

      state.discussion.messageCount = action.payload.messageCount;
    },
  },

  extraReducers: (builder) => {
    builder

      // --------------------------------------------------------------------
      // Create Note
      // --------------------------------------------------------------------

      .addCase(createNote.pending, (state) => {
        state.creating = true;
        state.error = null;
      })

      .addCase(createNote.fulfilled, (state, action) => {
        state.creating = false;
        state.error = null;

        const newNote = action.payload;

        /*
         * createNote returns NoteSummary.
         * Therefore it belongs in the notes list,
         * not currentNote.
         */
        state.notes = [
          newNote,
          ...state.notes.filter((note) => note.publicId !== newNote.publicId),
        ];
      })

      .addCase(createNote.rejected, (state, action) => {
        state.creating = false;

        state.error =
          action.payload ?? action.error.message ?? "Failed to create note.";
      })

      // --------------------------------------------------------------------
      // Upload Note
      // --------------------------------------------------------------------

      .addCase(uploadNote.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })

      .addCase(uploadNote.fulfilled, (state, action) => {
        state.uploading = false;
        state.error = null;

        const uploadedNote = action.payload;

        const index = state.notes.findIndex(
          (note) => note.publicId === uploadedNote.publicId,
        );

        const uploadedSummary: NoteSummary = {
          publicId: uploadedNote.publicId,
          title: uploadedNote.title,
          visibility: uploadedNote.visibility,
          createdAt: uploadedNote.createdAt,
          updatedAt: uploadedNote.updatedAt,
        };

        if (index !== -1) {
          state.notes[index] = uploadedSummary;
        } else {
          state.notes.unshift(uploadedSummary);
        }

        if (state.currentNote?.publicId === uploadedNote.publicId) {
          state.currentNote = uploadedNote;
        }
      })

      .addCase(uploadNote.rejected, (state, action) => {
        state.uploading = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to upload the document.";
      })

      // --------------------------------------------------------------------
      // Get All Notes
      // --------------------------------------------------------------------

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

      // --------------------------------------------------------------------
      // Get Shared Notes
      // --------------------------------------------------------------------

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

      // --------------------------------------------------------------------
      // Get Shared Notes By Me
      // --------------------------------------------------------------------

      .addCase(getSharedByMe.pending, (state) => {
        state.loadingSharedByMe = true;
        state.error = null;
      })

      .addCase(getSharedByMe.fulfilled, (state, action) => {
        state.loadingSharedByMe = false;
        state.error = null;

        state.sharedByMe = action.payload;
      })

      .addCase(getSharedByMe.rejected, (state, action) => {
        state.loadingSharedByMe = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load files shared by you.";
      })

      // --------------------------------------------------------------------
      // Get One Note
      // --------------------------------------------------------------------

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
          state.notes[index] = {
            publicId: action.payload.publicId,
            title: action.payload.title,
            visibility: action.payload.visibility,
            createdAt: action.payload.createdAt,
            updatedAt: action.payload.updatedAt,
          };
        }
      })

      .addCase(getOneNote.rejected, (state, action) => {
        state.loadingNote = false;

        state.error =
          action.payload ?? action.error.message ?? "Failed to load the note.";
      })

      // --------------------------------------------------------------------
      // Get Conversation
      // --------------------------------------------------------------------

      .addCase(getConversation.fulfilled, (state, action) => {
        state.error = null;

        if (!action.payload) {
          state.discussion = {
            ...initialDiscussionState,
            messages: [],
          };

          return;
        }

        state.discussion.conversationId = action.payload.conversationId;

        state.discussion.messages = action.payload.messages.map((message) => ({
          role: message.role,
          content: message.content,
          sources: message.sources ?? null,
        }));

        state.discussion.messageCount = action.payload.messageCount;
      })

      .addCase(getConversation.rejected, (state, action) => {
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load the conversation.";
      })

      // --------------------------------------------------------------------
      // Update Note
      // --------------------------------------------------------------------

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
          state.notes[index] = {
            publicId: action.payload.publicId,
            title: action.payload.title,
            visibility: action.payload.visibility,
            createdAt: action.payload.createdAt,
            updatedAt: action.payload.updatedAt,
          };
        }
      })

      .addCase(updateNote.rejected, (state, action) => {
        state.updating = false;

        state.error =
          action.payload ??
          action.error.message ??
          "Failed to update the note.";
      })

      // --------------------------------------------------------------------
      // Delete Note
      // --------------------------------------------------------------------

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

      // --------------------------------------------------------------------
      // Discuss Note
      // --------------------------------------------------------------------

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
          sources: result.sources ?? null,
        });

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

      // --------------------------------------------------------------------
      // Share Note
      // --------------------------------------------------------------------

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

      // --------------------------------------------------------------------
      // Revoke Note Share
      // --------------------------------------------------------------------

      .addCase(revokeNoteShare.pending, (state) => {
        state.sharing = true;
        state.error = null;
      })

      .addCase(revokeNoteShare.fulfilled, (state, action) => {
        state.sharing = false;
        state.error = null;

        state.sharedByMe = state.sharedByMe.filter(
          (share) => share.sharePublicId !== action.payload,
        );
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
  hydrateDiscussion,
} = NotesSlice.actions;

export default NotesSlice.reducer;
