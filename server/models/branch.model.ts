import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: String,
    manager: String,
    phone: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

export const Branch =
  mongoose.models.Branch ?? mongoose.model("Branch", branchSchema);
