import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: "present" | "absent" | "late" | "early_leave" | "holiday" | "leave";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceDoc>(
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
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ["present", "absent", "late", "early_leave", "holiday", "leave"],
      default: "present",
    },
    notes: String,
  },
  { timestamps: true }
);

AttendanceSchema.index(
  { businessId: 1, employeeId: 1, date: 1 },
  { unique: true }
);

export default mongoose.models.Attendance ||
  mongoose.model<IAttendanceDoc>("Attendance", AttendanceSchema);
