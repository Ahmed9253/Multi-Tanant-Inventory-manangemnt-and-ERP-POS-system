import mongoose, { Schema, Document } from "mongoose";

export interface IEmployeeDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  departmentId?: mongoose.Types.ObjectId;
  position?: string;
  employmentStatus: "active" | "inactive" | "terminated" | "on_leave";
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  baseSalary?: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployeeDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    storeId: { type: Schema.Types.ObjectId, ref: "Store" },
    employeeNumber: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
    hireDate: { type: Date, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    position: { type: String, trim: true },
    employmentStatus: {
      type: String,
      enum: ["active", "inactive", "terminated", "on_leave"],
      default: "active",
    },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "intern"],
      default: "full_time",
    },
    baseSalary: { type: Number },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EmployeeSchema.index(
  { businessId: 1, employeeNumber: 1 },
  { unique: true }
);
EmployeeSchema.index({ businessId: 1, storeId: 1 });
EmployeeSchema.index({ businessId: 1, departmentId: 1 });
EmployeeSchema.index({ businessId: 1, firstName: "text", lastName: "text" });

export default mongoose.models.Employee ||
  mongoose.model<IEmployeeDoc>("Employee", EmployeeSchema);
