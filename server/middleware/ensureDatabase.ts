import type { NextFunction, Request, Response } from "express";
import { connectDB, isDatabaseConnected } from "../db/connect";

/**
 * Ensures MongoDB is connected before an API route runs. The health endpoint
 * is skipped so it can always report the current database state.
 */
export async function ensureDatabase(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  if (request.path === "/health" || request.path === "/health/") {
    next();
    return;
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    const dbError = new Error(
      error instanceof Error ? error.message : "Database connection failed",
    ) as Error & { status?: number };
    dbError.status = 503;
    next(dbError);
  }
}

export { isDatabaseConnected };
