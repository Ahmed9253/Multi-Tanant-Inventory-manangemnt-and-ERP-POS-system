import { start } from "./server";

start().catch((error) => {
  console.error("Could not start API:", error?.message || error);
  process.exit(1);
});