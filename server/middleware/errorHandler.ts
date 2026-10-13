import type { NextFunction, Request, Response } from "express";

type HttpError = Error & {
  status?: number;
  statusCode?: number;
  code?: number | string;
  errors?: Record<string, { message?: string }>;
};

function resolveStatus(error: HttpError): number {
  if (typeof error.status === "number") return error.status;
  if (typeof error.statusCode === "number") return error.statusCode;
  if (error.name === "ValidationError") return 400;
  if (error.name === "CastError") return 400;
  if (error.code === 11000) return 409;
  return 500;
}

function resolveMessage(error: HttpError, status: number): string {
  if (status === 503) return "Database unavailable. Please try again later.";
  if (error.code === 11000) return "A record with that value already exists";
  if (error.name === "CastError") return "Invalid identifier";
  if (error.name === "ValidationError" && error.errors) {
    return (
      Object.values(error.errors)
        .map((item) => item.message)
        .filter(Boolean)
        .join(", ") || "Validation failed"
    );
  }
  if (status < 500 && error.message) return error.message;
  return "Internal server error";
}

export function notFoundHandler(request: Request, response: Response): void {
  response.status(404).json({
    error: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(
  error: HttpError,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  const status = resolveStatus(error);
  if (status >= 500) console.error("[api]", error);
  response.status(status).json({ error: resolveMessage(error, status) });
}
