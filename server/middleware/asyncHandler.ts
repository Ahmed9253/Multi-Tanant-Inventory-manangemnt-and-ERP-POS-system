import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async route handler so rejected promises are forwarded to the
 * Express error handler instead of becoming unhandled rejections.
 */
export function asyncHandler(handler: AsyncHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
