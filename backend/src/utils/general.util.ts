import type { Request, Response, NextFunction } from "express";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

type AsyncRequestHandler<T = Record<string, string>> = (
  req: Request<T>,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = <T = Record<string, string>>(
  fn: AsyncRequestHandler<T>,
) => {
  return (req: Request<T>, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, cause?: Error) {
    super(message, cause ? { cause } : undefined);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export async function generateCheckSumSha256(
  filePath: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
}
