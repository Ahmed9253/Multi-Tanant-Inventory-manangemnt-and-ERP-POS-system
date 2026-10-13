import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: ["hr", "cashier", "manager"],
      default: "cashier",
    },
    department: String,
    position: String,
    salary: { type: Number, default: 0 },
    hireDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export const Employee =
  mongoose.models.Employee ?? mongoose.model("Employee", employeeSchema);
