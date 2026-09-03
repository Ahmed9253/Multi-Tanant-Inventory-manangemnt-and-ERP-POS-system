import mongoose, { Schema, Document } from "mongoose";

export interface ISupplierDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplierDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    taxNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

SupplierSchema.index({ businessId: 1, name: "text", company: "text" });
SupplierSchema.index({ businessId: 1, status: 1 });

export default mongoose.models.Supplier ||
  mongoose.model<ISupplierDoc>("Supplier", SupplierSchema);
