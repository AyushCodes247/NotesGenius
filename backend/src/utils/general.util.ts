import type { Request, Response, NextFunction } from "express";

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
