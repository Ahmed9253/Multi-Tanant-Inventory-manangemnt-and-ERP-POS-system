import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomerDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

CustomerSchema.index({ businessId: 1, name: "text", phone: "text", email: "text" });
CustomerSchema.index({ businessId: 1, phone: 1 });
CustomerSchema.index({ businessId: 1, status: 1 });

export default mongoose.models.Customer ||
  mongoose.model<ICustomerDoc>("Customer", CustomerSchema);
