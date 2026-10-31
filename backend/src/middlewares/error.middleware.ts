import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodError } from "zod";

import env from "@configs/env.config.js";
import { AppError } from "@/utils/general.util.js";

const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error: AppError;
  let validationErrors: { field: string; message: string }[] | undefined;

  if (err instanceof ZodError) {
    validationErrors = err.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : "_root",
      message: issue.message,
    }));

    error = new AppError("Validation failed", 400, err);
  } else if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError(
      "Internal server error",
      500,
      err instanceof Error ? err : undefined,
    );
  }

  const response: Record<string, unknown> = {
    success: false,
    status: error.status,
    message: error.message,
  };

  if (validationErrors) {
    response["errors"] = validationErrors;
  }

  if (env.NODE_ENV !== "production") {
    response["error"] = {
      name: error.name,
      statusCode: error.statusCode,
      stack: error.stack,
      cause: error.cause,
    };
  }

  res.status(error.statusCode).json(response);
};

export default globalErrorHandler;
