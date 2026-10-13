import type { IncomingMessage, ServerResponse } from "node:http";
import type { Request, Response } from "express";
import app from "../server/app";

/**
 * Vercel serverless entry point.
 *
 * The whole Express app lives in `../server` and is mounted here as a single
 * function. `vercel.json` rewrites every `/api/*` request to this handler while
 * keeping the original URL, so Express routes such as `/api/products` match.
 */
export default function handler(
  request: IncomingMessage,
  response: ServerResponse,
): void {
  app(
    request as unknown as Request,
    response as unknown as Response,
  );
}
