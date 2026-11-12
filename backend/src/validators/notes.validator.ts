import { z } from "zod";

const notesPublicIdValidator = z.string().uuid("Invalid note public ID.");

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

export const createNoteSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title is required.")
        .max(200, "Title cannot exceed 200 characters."),
    })
    .strict(),
});

export const discussNoteSchema = z.object({
  params: z.object({
    notesPublicId: notesPublicIdValidator,
  }),

  body: z
    .object({
      command: z
        .string()
        .trim()
        .min(1, "Command is required.")
        .max(50, "Command cannot exceed 50 characters."),

      query: z
        .string()
        .trim()
        .min(1, "Query is required.")
        .max(5000, "Query cannot exceed 5000 characters."),

      conversationId: z
        .string()
        .trim()
        .min(1, "Conversation ID cannot be empty.")
        .optional(),
    })
    .strict(),
});

export const uploadNoteSchema = z.object({
  params: z.object({
    notesPublicId: notesPublicIdValidator,
  }),
});

export const getOneNoteSchema = z.object({
  params: z.object({
    notesPublicId: notesPublicIdValidator,
  }),
});

export const updateNoteSchema = z.object({
  params: z.object({
    notesPublicId: notesPublicIdValidator,
  }),

  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title cannot be empty.")
        .max(200, "Title cannot exceed 200 characters.")
        .optional(),

      visibility: z
        .enum(["private", "public"], {
          message: "Visibility must be either private or public.",
        })
        .optional(),

      topic: z
        .string()
        .trim()
        .max(200, "Topic cannot exceed 200 characters.")
        .optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.title !== undefined ||
        data.visibility !== undefined ||
        data.topic !== undefined,
      {
        message: "At least one field is required to update the note.",
      },
    ),
});

export const deleteNoteSchema = z.object({
  params: z.object({
    notesPublicId: notesPublicIdValidator,
  }),
});

export const shareNoteSchema = z.object({
  params: z.object({
    notesPublicId: notesPublicIdValidator,
  }),

  body: z
    .object({
      userHandle: userHandleValidator,
    })
    .strict(),
});

export const revokeNoteShareSchema = z.object({
  params: z.object({
    notesPublicId: notesPublicIdValidator,
    sharePublicId: z.string().uuid("Invalid share public ID."),
  }),
});
