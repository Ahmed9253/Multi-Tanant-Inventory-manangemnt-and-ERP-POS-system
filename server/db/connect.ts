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

let dbConnectionPromise: Promise<void> | null = null;

/**
 * Connects to MongoDB once and reuses the connection for every subsequent
 * request (important for serverless cold starts). A failed attempt resets the
 * cached promise so the next request can retry.
 */
export function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!dbConnectionPromise) {
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
    })().catch((error) => {
      dbConnectionPromise = null;
      throw error;
    });
  }
  return dbConnectionPromise;
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
