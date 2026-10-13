import type { Request, Response } from "express";
import { isDatabaseConnected } from "../db/connect";

export function getHealth(_request: Request, response: Response): void {
  response.json({
    ok: true,
    database: isDatabaseConnected() ? "connected" : "disconnected",
  });
}
