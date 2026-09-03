import mongoose, { Schema, Document } from "mongoose";

export interface IBusinessDoc extends Document {
  name: string;
  legalName?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  currency: string;
  timezone: string;
  taxRate: number;
  taxName: string;
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusinessDoc>(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    logo: { type: String },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, required: true, default: "US" },
    currency: { type: String, required: true, default: "USD" },
    timezone: { type: String, required: true, default: "UTC" },
    taxRate: { type: Number, required: true, default: 0 },
    taxName: { type: String, required: true, default: "Tax" },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

BusinessSchema.index({ status: 1 });

export default mongoose.models.Business ||
  mongoose.model<IBusinessDoc>("Business", BusinessSchema);
