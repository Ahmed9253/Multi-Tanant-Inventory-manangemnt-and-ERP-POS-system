import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { ensureDatabase } from "./middleware/ensureDatabase";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    env.corsOrigins.length > 0 ? cors({ origin: env.corsOrigins }) : cors(),
  );
  app.use(express.json({ limit: "1mb" }));

  // Connect to MongoDB before running API routes (health is exempt).
  app.use("/api", ensureDatabase, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();

export { app };
export default app;
