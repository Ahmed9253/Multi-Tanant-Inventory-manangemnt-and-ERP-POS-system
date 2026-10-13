export type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  color?: string;
  icon?: string;
  barcode?: string;
  sku?: string;
};

export type Metrics = {
  revenue: number;
  orders: number;
  inventoryValue: number;
  units: number;
  lowStock: number;
  daily?: { _id: string; revenue: number; orders: number }[];
};

export type Branch = {
  _id: string;
  name: string;
  code: string;
  address?: string;
  manager?: string;
  phone?: string;
  status: string;
};

export type MonthlyReport = {
  month: string;
  bills: number;
  revenue: number;
  tax: number;
  discounts: number;
  items: number;
};

export type Customer = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export type Settings = {
  taxRate: number;
  storeName: string;
  currency: string;
};

export type View =
  | "sell"
  | "dashboard"
  | "inventory"
  | "branches"
  | "reports"
  | "customers"
  | "employees"
  | "payroll"
  | "settings";

export type Role = "admin" | "hr" | "cashier" | "manager";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Employee = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "hr" | "cashier" | "manager";
  department?: string;
  position?: string;
  salary: number;
  hireDate: string;
  status: "active" | "inactive";
};

export type Payroll = {
  _id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: "pending" | "paid";
  paidAt?: string;
};

export type ToastKind = "success" | "error" | "info";

export type Toast = {
  id: number;
  kind: ToastKind;
  text: string;
};

export type BranchForm = {
  name: string;
  code: string;
  address: string;
  manager: string;
  phone: string;
};

export type ProductForm = {
  name: string;
  category: string;
  price: string;
  stock: string;
  barcode: string;
};

export type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export type Notice = { kind: "error" | "success"; text: string } | null;

export type HeldOrder = {
  id: number;
  label: string;
  cart: Record<string, number>;
  customer: string;
  discount: string;
  payment: string;
};

export type SalePayload = {
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customer: string;
};

export type EmployeeForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "hr" | "cashier" | "manager";
  department: string;
  position: string;
  salary: string;
  status: "active" | "inactive";
};

export type PayrollForm = {
  employeeId: string;
  employeeName: string;
  month: string;
  baseSalary: string;
  bonus: string;
  deductions: string;
};
