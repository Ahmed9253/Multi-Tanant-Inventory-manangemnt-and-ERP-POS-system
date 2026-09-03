import mongoose from "mongoose";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const collections = [
  "businesses", "users", "memberships", "sessions", "roles", "stores",
  "categories", "products", "inventories", "inventorymovements", "customers",
  "suppliers", "sales", "purchases", "employees", "departments", "attendances",
  "leaves", "payrolls", "expenses", "auditlogs", "notifications",
];

async function clear() {
  const conn = await mongoose.connect(MONGODB_URI);
  const db = conn.connection.db;
  for (const name of collections) {
    const result = await db.collection(name).deleteMany({});
    console.log(`Cleared ${name}: ${result.deletedCount} docs`);
  }
  await mongoose.disconnect();
  console.log("Done. You can now reseed with `node scripts/seed.mjs`.");
}

clear()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Clear failed:", err);
    process.exit(1);
  });
