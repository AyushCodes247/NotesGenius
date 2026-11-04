import multer, { type FileFilterCallback } from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Request } from "express";
import env from "@configs/env.config.js";
import { AppError } from "@utils/general.util.js";

const uploadPath = env.UPLOAD_PATHS;

const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;

fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadPath);
  },

  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}${extension}`;

    cb(null, filename);
  },
});

const allowedFiles: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".txt": ["text/plain"],
  ".md": ["text/markdown", "text/plain", "text/x-markdown"],
  ".png": ["image/png"],
};

const fileFilter: multer.Options["fileFilter"] = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = allowedFiles[extension];

  if (!allowedMimeTypes?.includes(file.mimetype)) {
    return cb(
      new AppError("Only PDF, DOCX, TXT, MD and PNG files are allowed.", 400),
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: MAX_UPLOAD_SIZE,
  },
});

export default upload;
