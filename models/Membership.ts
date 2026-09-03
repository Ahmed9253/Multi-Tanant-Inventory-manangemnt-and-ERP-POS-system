import mongoose, { Schema, Document } from "mongoose";

export interface IMembershipDoc extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  storeIds: mongoose.Types.ObjectId[];
  status: "active" | "inactive";
  invitedBy?: mongoose.Types.ObjectId;
  joinedAt: Date;
}

const MembershipSchema = new Schema<IMembershipDoc>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  storeIds: [{ type: Schema.Types.ObjectId, ref: "Store" }],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
  joinedAt: { type: Date, default: Date.now },
});

MembershipSchema.index({ userId: 1, businessId: 1 }, { unique: true });
MembershipSchema.index({ businessId: 1 });
MembershipSchema.index({ userId: 1 });

export default mongoose.models.Membership ||
  mongoose.model<IMembershipDoc>("Membership", MembershipSchema);
