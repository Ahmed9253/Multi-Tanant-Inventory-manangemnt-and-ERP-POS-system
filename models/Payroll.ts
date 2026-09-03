import mongoose, { Schema, Document } from "mongoose";

export interface IPayrollDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  baseSalary: number;
  allowances: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: "draft" | "pending_approval" | "approved" | "paid" | "cancelled";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema = new Schema<IPayrollDoc>(
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
    payPeriodStart: { type: Date, required: true },
    payPeriodEnd: { type: Date, required: true },
    baseSalary: { type: Number, required: true, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    grossPay: { type: Number, required: true, default: 0 },
    netPay: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["draft", "pending_approval", "approved", "paid", "cancelled"],
      default: "draft",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    notes: String,
  },
  { timestamps: true }
);

PayrollSchema.index({ businessId: 1, employeeId: 1, payPeriodStart: 1 });
PayrollSchema.index({ businessId: 1, status: 1 });

export default mongoose.models.Payroll ||
  mongoose.model<IPayrollDoc>("Payroll", PayrollSchema);
