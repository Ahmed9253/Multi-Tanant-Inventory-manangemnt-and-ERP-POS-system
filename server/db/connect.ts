import mongoose from "mongoose";
import { env } from "../config/env";
import { Product } from "../models/product.model";
import { Setting } from "../models/setting.model";

/**
 * Removes the obsolete `businessId_1_sku_1` product index left behind by
 * earlier versions of the app. Safe to run on every cold start.
 */
async function prepareProductIndexes(): Promise<void> {
  const indexes = await Product.collection.listIndexes().toArray();
  const legacyIndex = indexes.find(
    (index) => index.name === "businessId_1_sku_1",
  );
  if (legacyIndex) {
    await Product.collection.dropIndex(legacyIndex.name);
    console.log("Removed legacy product index businessId_1_sku_1");
  }
}

/** How long to remember a failed connection before trying again. */
const RETRY_COOLDOWN_MS = 5_000;

let dbConnectionPromise: Promise<void> | null = null;
let lastFailureAt = 0;
let lastError: Error | null = null;

function databaseUnavailableError(): Error & { status: number } {
  const error = new Error(
    lastError?.message ?? "Database connection failed",
  ) as Error & { status: number };
  error.status = 503;
  return error;
}

/**
 * Connects to MongoDB once and reuses the connection for every subsequent
 * request (important for serverless cold starts).
 *
 * A failed attempt is remembered for a short cooldown so an outage does not
 * trigger a fresh 10s connection attempt (and a log line) on every request —
 * instead, requests fail fast with a 503 until the cooldown elapses.
 */
export function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (dbConnectionPromise) return dbConnectionPromise;
  if (lastFailureAt && Date.now() - lastFailureAt < RETRY_COOLDOWN_MS) {
    return Promise.reject(databaseUnavailableError());
  }
  dbConnectionPromise = (async () => {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10_000,
    });
    await prepareProductIndexes();
    await Setting.updateOne(
      { key: "firstUseAt" },
      { $setOnInsert: { key: "firstUseAt", value: new Date() } },
      { upsert: true },
    );
  })()
    .then(() => {
      lastFailureAt = 0;
      lastError = null;
    })
    .catch((error) => {
      lastError = error instanceof Error ? error : new Error(String(error));
      lastFailureAt = Date.now();
      throw lastError;
    })
    .finally(() => {
      dbConnectionPromise = null;
    });
  return dbConnectionPromise;
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
