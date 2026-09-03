import mongoose, { Schema, Document } from "mongoose";

export interface IStoreDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  manager?: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  settings: {
    currency?: string;
    taxRate?: number;
    receiptFooter?: string;
    lowStockThreshold?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStoreDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    settings: {
      currency: String,
      taxRate: Number,
      receiptFooter: String,
      lowStockThreshold: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

StoreSchema.index({ businessId: 1, code: 1 }, { unique: true });
StoreSchema.index({ businessId: 1 });

export default mongoose.models.Store ||
  mongoose.model<IStoreDoc>("Store", StoreSchema);
