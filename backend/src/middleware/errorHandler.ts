import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export interface ApiError extends Error {
  statusCode?: number;
}

function normalizeError(err: unknown): { statusCode: number; message: string; stack?: string } {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message, stack: err.stack };
  }
  if (err instanceof ZodError) {
    const msg = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return { statusCode: 400, message: msg, stack: err.stack };
  }
  if (err instanceof mongoose.Error.CastError) {
    return { statusCode: 400, message: 'Invalid resource id', stack: err.stack };
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join('; '),
      stack: err.stack,
    };
  }
  if (err && typeof err === 'object' && 'statusCode' in err && typeof (err as ApiError).message === 'string') {
    const e = err as ApiError;
    const code =
      typeof e.statusCode === 'number' && e.statusCode >= 400 && e.statusCode < 600
        ? e.statusCode
        : 500;
    return { statusCode: code, message: e.message, stack: e.stack };
  }
  if (err instanceof Error) {
    return { statusCode: 500, message: err.message || 'Internal server error', stack: err.stack };
  }
  return { statusCode: 500, message: 'Internal server error' };
}

export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    message: 'Not Found',
  });
}

export async function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const { statusCode, message, stack } = normalizeError(err);

  if (statusCode >= 500) {
    console.error('[Bornblix API]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && stack ? { stack } : {}),
  });
};
