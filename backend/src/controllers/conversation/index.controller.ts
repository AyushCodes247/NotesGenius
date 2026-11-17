import type { Request, Response, RequestHandler } from "express";

import { asyncHandler } from "@utils/general.util.js";
import ConversationService from "@services/conversation/index.service.js";

class ConversationController {
  get: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<unknown> => {
      const userPublicId = req.user!.publicId;

      const { notesPublicId } = req.params;

      if (!notesPublicId) {
        return res.status(400).json({
          success: false,
          message: "Note public ID is required.",
        });
      }

      const conversation = await ConversationService.get({
        userPublicId,
        notesPublicId: notesPublicId.toString(),
      });

      return res.status(200).json({
        success: true,
        conversation,
      });
    },
  );
}

export default new ConversationController();
