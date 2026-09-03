import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Category" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

CategorySchema.index({ businessId: 1, name: 1 });
CategorySchema.index({ businessId: 1 });

export default mongoose.models.Category ||
  mongoose.model<ICategoryDoc>("Category", CategorySchema);
