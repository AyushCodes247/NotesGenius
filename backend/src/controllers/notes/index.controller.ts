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
}

export default new NotesController();
