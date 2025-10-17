import { Request, Response, NextFunction } from 'express';

import { AppError } from '../shared/exceptions';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
