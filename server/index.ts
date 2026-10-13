import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./db/connect";

export { app, connectDB };
export default app;

export async function start(): Promise<void> {
  app.listen(env.port, () => {
    console.log(`WorkNest POS API running on http://localhost:${env.port}`);
  });
  connectDB().catch((error) => {
    console.warn("Could not connect to MongoDB:", error?.message ?? error);
    console.warn("Server is running but database features are unavailable.");
  });
}
