import mongoose, { Schema, Document } from "mongoose";

export interface IRoleDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRoleDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: [{ type: String }],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RoleSchema.index({ businessId: 1, name: 1 }, { unique: true });
RoleSchema.index({ businessId: 1 });

export default mongoose.models.Role ||
  mongoose.model<IRoleDoc>("Role", RoleSchema);
