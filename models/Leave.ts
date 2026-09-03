import mongoose, { Schema, Document } from "mongoose";

export interface ILeaveDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeaveDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    notes: String,
  },
  { timestamps: true }
);

LeaveSchema.index({ businessId: 1, employeeId: 1, startDate: 1 });
LeaveSchema.index({ businessId: 1, status: 1 });

export default mongoose.models.Leave ||
  mongoose.model<ILeaveDoc>("Leave", LeaveSchema);
