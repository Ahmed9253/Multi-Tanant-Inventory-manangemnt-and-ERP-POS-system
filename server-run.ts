import { start } from "./server/index";

start().catch((error) => {
  console.error("Could not start API:", error?.message || error);
  process.exit(1);
});
