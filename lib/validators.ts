import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().default("pcs"),
  costPrice: z.number().min(0, "Cost price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  taxRate: z.number().min(0).max(100).default(0),
  minimumStock: z.number().min(0).default(0),
  maximumStock: z.number().min(0).default(0),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  employmentType: z
    .enum(["full_time", "part_time", "contract", "intern"])
    .default("full_time"),
  baseSalary: z.number().optional(),
  storeId: z.string().optional(),
});

export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().optional(),
  storeId: z.string().optional(),
});

export const attendanceSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["present", "absent", "late", "early_leave", "holiday", "leave"]),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().optional(),
});

export const leaveSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  leaveType: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
});

export const payrollSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  payPeriodStart: z.string().min(1, "Pay period start is required"),
  payPeriodEnd: z.string().min(1, "Pay period end is required"),
  baseSalary: z.number().min(0),
  allowances: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  notes: z.string().optional(),
});
