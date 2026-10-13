import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    employeeName: String,
    month: String,
    baseSalary: Number,
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: Number,
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: Date,
  },
  { timestamps: true },
);

export const Payroll =
  mongoose.models.Payroll ?? mongoose.model("Payroll", payrollSchema);
