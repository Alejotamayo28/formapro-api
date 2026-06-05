import { NextFunction, Request, Response } from 'express';
import { ValidateError } from 'tsoa';

export interface ErrorResponse {
  message: string;
  details?: unknown;
}

export function notFoundHandler(_request: Request, response: Response): void {
  response.status(404).json({ message: 'Not found' });
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
): void {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ValidateError) {
    response.status(422).json({
      message: 'Validation failed',
      details: error.fields,
    } satisfies ErrorResponse);
    return;
  }

  if (error instanceof Error) {
    const status = error.message.includes('Missing required environment variable') ? 500 : 500;
    response.status(status).json({
      message: error.message,
    } satisfies ErrorResponse);
    return;
  }

  response.status(500).json({ message: 'Unexpected error' } satisfies ErrorResponse);
}
