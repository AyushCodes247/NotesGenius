import type { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "@utils/general.util.js";
import NotesService from "@services/notes/index.service.js";

class NotesController {
  create: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;
      const { title } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({
          success: false,
          message: "title is required",
        });
      }

      const note = await NotesService.create({
        userPublicId,
        title: title.trim(),
      });

      return res.status(201).json({
        success: true,
        message: "note created successfully.",
        note,
      });
    },
  );

  discuss: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;
      const { command, query, conversationId } = req.body;
      const { notesPublicId } = req.params;

      if (!notesPublicId) {
        return res.status(400).json({
          success: false,
          message: "Note public ID is required.",
        });
      }

      if (!command?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Command is required.",
        });
      }

      if (!query?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Query is required.",
        });
      }

      const result = await NotesService.discuss({
        userPublicId,
        notesPublicId: notesPublicId!.toString(),
        command: command.trim(),
        query: query.trim(),
        conversationId: conversationId?.trim(),
      });

      return res.status(200).json({
        success: true,
        message: "Response generated successfully",
        result,
      });
    },
  );

  upload: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;
      const file = req.file;
      const { notesPublicId } = req.params;

      if (!notesPublicId) {
        return res.status(400).json({
          success: false,
          message: "Note public ID is required.",
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "File is required.",
        });
      }

      const note = await NotesService.upload({
        userPublicId,
        file,
        notesPublicId: notesPublicId!.toString(),
      });

      return res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: {
          note,
        },
      });
    },
  );

  getAll: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;

      const notes = await NotesService.getAll({
        userPublicId,
      });

      return res.status(200).json({
        success: true,
        data: notes,
      });
    },
  );

  getOne: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;
      const { notesPublicId } = req.params;

      if (!notesPublicId) {
        return res.status(400).json({
          success: false,
          message: "Note public ID is required.",
        });
      }

      const note = await NotesService.getOne({
        userPublicId,
        notesPublicId: notesPublicId!.toString(),
      });

      return res.status(200).json({
        success: true,
        note,
      });
    },
  );

  update: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;
      const { notesPublicId } = req.params;

      if (!notesPublicId) {
        return res.status(400).json({
          success: false,
          message: "Note public ID is required.",
        });
      }

      const { title, visibility, topic } = req.body;

      const note = await NotesService.update({
        userPublicId,
        notesPublicId: notesPublicId!.toString(),
        title,
        visibility,
        topic,
      });

      return res.status(200).json({
        success: true,
        note,
      });
    },
  );

  delete: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;
      const { notesPublicId } = req.params;

      if (!notesPublicId) {
        return res.status(400).json({
          success: false,
          message: "Note public ID is required.",
        });
      }

      const deletedNote = await NotesService.delete({
        userPublicId,
        notesPublicId: notesPublicId!.toString(),
      });

      return res.status(200).json({
        success: true,
        message: "notes deleted successfully.",
        deletedNote,
      });
    },
  );

  share: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;
      const { notesPublicId } = req.params;

      const { userHandle } = req.body;

      if (!notesPublicId) {
        return res.status(400).json({
          success: false,
          message: "Note public ID is required.",
        });
      }

      if (!userHandle || typeof userHandle !== "string") {
        return res.status(400).json({
          success: false,
          message: "Recipient user handle is required.",
        });
      }

      const share = await NotesService.share({
        userPublicId,
        notesPublicId: notesPublicId.toString(),
        recipientUserHandle: userHandle.trim().toLowerCase(),
      });

      return res.status(201).json({
        success: true,
        message: "Note shared successfully.",
        share,
      });
    },
  );

  getShared: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;

      const notes = await NotesService.getShared({
        userPublicId,
      });

      return res.status(200).json({
        success: true,
        notes,
      });
    },
  );

  revokeShare: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;
      const { notesPublicId, sharePublicId } = req.params;

      if (!notesPublicId || !sharePublicId) {
        return res.status(400).json({
          success: false,
          message: "Note public ID and share public ID are required.",
        });
      }

      const share = await NotesService.revokeShare({
        userPublicId,
        notesPublicId: notesPublicId.toString(),
        sharePublicId: sharePublicId.toString(),
      });

      return res.status(200).json({
        success: true,
        message: "Note share revoked successfully.",
        share,
      });
    },
  );
}

export default new NotesController();
