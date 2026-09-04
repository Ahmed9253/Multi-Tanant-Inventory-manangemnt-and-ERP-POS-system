import type { IncomingMessage, ServerResponse } from "node:http";
import app, { connectDB } from "../server";

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  try {
    await connectDB();
  } catch (error) {
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Database connection failed",
      }),
    );
    return;
  }
  app(request, response);
}