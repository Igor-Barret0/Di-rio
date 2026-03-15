import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  res.status(500).json({ error: "Erro interno do servidor" });
}
