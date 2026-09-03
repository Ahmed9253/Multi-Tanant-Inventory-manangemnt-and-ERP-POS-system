import mongoose, { Schema, Document } from "mongoose";

export interface IDepartmentDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  managerId?: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartmentDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    managerId: { type: Schema.Types.ObjectId, ref: "Employee" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

DepartmentSchema.index({ businessId: 1, name: 1 }, { unique: true });

export default mongoose.models.Department ||
  mongoose.model<IDepartmentDoc>("Department", DepartmentSchema);
