import mongoose from "mongoose";

const appSettingsSchema = new mongoose.Schema({
  taxRate: { type: Number, default: 0.08 },
  storeName: { type: String, default: "WorkNest" },
  currency: { type: String, default: "$" },
});

export const AppSettings =
  mongoose.models.AppSettings ??
  mongoose.model("AppSettings", appSettingsSchema);
