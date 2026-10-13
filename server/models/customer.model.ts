import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    notes: String,
  },
  { timestamps: true },
);

export const Customer =
  mongoose.models.Customer ?? mongoose.model("Customer", customerSchema);
