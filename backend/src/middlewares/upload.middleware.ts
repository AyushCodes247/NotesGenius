import type { NextFunction, RequestHandler, Request, Response } from "express";
import multer from "multer";
import { asyncHandler, AppError } from "@utils/general.util.js";
import upload from "@configs/multer.config.js";

const documentAuthentication: RequestHandler = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    upload.single("document")(req, _res, (error: unknown) => {
      if (!error) {
        return next();
      }

      if (error instanceof multer.MulterError) {
        switch (error.code) {
          case "LIMIT_FILE_SIZE":
            return next(new AppError("File size must not exceed 4 MB.", 400));
          case "LIMIT_FILE_COUNT":
          case "LIMIT_UNEXPECTED_FILE":
            return next(new AppError("Only one file can be uploaded.", 400));
          default:
            return next(new AppError("File upload failed.", 400));
        }
      }

      return next(error);
    });
  },
);

export default documentAuthentication;
