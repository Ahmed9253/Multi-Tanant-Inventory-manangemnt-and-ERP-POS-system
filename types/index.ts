export type ObjectId = string;

export interface IBusiness {
  _id: ObjectId;
  name: string;
  legalName?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  currency: string;
  timezone: string;
  taxRate: number;
  taxName: string;
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  emailVerified?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMembership {
  _id: ObjectId;
  userId: ObjectId;
  businessId: ObjectId;
  role: ObjectId;
  storeIds: ObjectId[];
  status: "active" | "inactive";
  invitedBy?: ObjectId;
  joinedAt: Date;
}

export interface ISession {
  _id: ObjectId;
  userId: ObjectId;
  businessId: ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IRole {
  _id: ObjectId;
  businessId: ObjectId;
  name: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStore {
  _id: ObjectId;
  businessId: ObjectId;
  name: string;
  code: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  manager?: ObjectId;
  status: "active" | "inactive";
  settings: IStoreSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreSettings {
  currency?: string;
  taxRate?: number;
  receiptFooter?: string;
  lowStockThreshold?: number;
}

export interface ICategory {
  _id: ObjectId;
  businessId: ObjectId;
  name: string;
  description?: string;
  parentId?: ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: ObjectId;
  businessId: ObjectId;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  categoryId?: ObjectId;
  brand?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  minimumStock: number;
  maximumStock: number;
  images: string[];
  hasVariants: boolean;
  variants: IProductVariant[];
  status: "active" | "inactive" | "archived";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariant {
  name: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface IInventory {
  _id: ObjectId;
  businessId: ObjectId;
  storeId: ObjectId;
  productId: ObjectId;
  variantSku?: string;
  quantity: number;
  reservedQuantity: number;
  incomingQuantity: number;
  lastCountedAt?: Date;
  updatedAt: Date;
}

export interface IInventoryMovement {
  _id: ObjectId;
  businessId: ObjectId;
  storeId: ObjectId;
  productId: ObjectId;
  variantSku?: string;
  quantity: number;
  type:
    | "PURCHASE_RECEIVED"
    | "SALE"
    | "SALE_RETURN"
    | "ADJUSTMENT"
    | "TRANSFER_OUT"
    | "TRANSFER_IN"
    | "DAMAGE"
    | "EXPIRY"
    | "OPENING_BALANCE";
  reference?: string;
  referenceId?: ObjectId;
  userId: ObjectId;
  notes?: string;
  createdAt: Date;
}

export interface ICustomer {
  _id: ObjectId;
  businessId: ObjectId;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplier {
  _id: ObjectId;
  businessId: ObjectId;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface ISale {
  _id: ObjectId;
  businessId: ObjectId;
  storeId: ObjectId;
  cashierId: ObjectId;
  customerId?: ObjectId;
  receiptNumber: string;
  invoiceNumber: string;
  items: ISaleItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  total: number;
  payments: ISalePayment[];
  status: "completed" | "refunded" | "partially_refunded" | "voided";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISaleItem {
  productId: ObjectId;
  variantSku?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface ISalePayment {
  method: "cash" | "card" | "bank_transfer" | "mobile" | "other";
  amount: number;
  reference?: string;
  receivedAt: Date;
}

export interface IPurchase {
  _id: ObjectId;
  businessId: ObjectId;
  storeId: ObjectId;
  supplierId?: ObjectId;
  purchaseOrderNumber: string;
  items: IPurchaseItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: "draft" | "ordered" | "received" | "partially_received" | "cancelled";
  notes?: string;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseItem {
  productId: ObjectId;
  variantSku?: string;
  name: string;
  sku: string;
  quantity: number;
  receivedQuantity: number;
  costPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface IEmployee {
  _id: ObjectId;
  businessId: ObjectId;
  storeId?: ObjectId;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  departmentId?: ObjectId;
  position?: string;
  employmentStatus: "active" | "inactive" | "terminated" | "on_leave";
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  baseSalary?: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  userId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartment {
  _id: ObjectId;
  businessId: ObjectId;
  name: string;
  description?: string;
  managerId?: ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  _id: ObjectId;
  businessId: ObjectId;
  employeeId: ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: "present" | "absent" | "late" | "early_leave" | "holiday" | "leave";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeave {
  _id: ObjectId;
  businessId: ObjectId;
  employeeId: ObjectId;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approvedBy?: ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayroll {
  _id: ObjectId;
  businessId: ObjectId;
  employeeId: ObjectId;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  baseSalary: number;
  allowances: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: "draft" | "pending_approval" | "approved" | "paid" | "cancelled";
  approvedBy?: ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpense {
  _id: ObjectId;
  businessId: ObjectId;
  storeId?: ObjectId;
  categoryId?: string;
  amount: number;
  description: string;
  date: Date;
  receiptUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id: ObjectId;
  businessId: ObjectId;
  userId: ObjectId;
  action: string;
  resource: string;
  resourceId?: ObjectId;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

export interface INotification {
  _id: ObjectId;
  businessId: ObjectId;
  userId: ObjectId;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  link?: string;
  createdAt: Date;
}

export const PERMISSIONS = {
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",
  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_MANAGE: "categories.manage",
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_ADJUST: "inventory.adjust",
  INVENTORY_TRANSFER: "inventory.transfer",
  SALES_VIEW: "sales.view",
  SALES_CREATE: "sales.create",
  SALES_UPDATE: "sales.update",
  SALES_REFUND: "sales.refund",
  PURCHASES_VIEW: "purchases.view",
  PURCHASES_CREATE: "purchases.create",
  PURCHASES_RECEIVE: "purchases.receive",
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_UPDATE: "customers.update",
  SUPPLIERS_VIEW: "suppliers.view",
  SUPPLIERS_CREATE: "suppliers.create",
  SUPPLIERS_UPDATE: "suppliers.update",
  STORES_VIEW: "stores.view",
  STORES_CREATE: "stores.create",
  STORES_UPDATE: "stores.update",
  STORES_DELETE: "stores.delete",
  USERS_VIEW: "users.view",
  USERS_INVITE: "users.invite",
  USERS_MANAGE: "users.manage",
  ROLES_VIEW: "roles.view",
  ROLES_MANAGE: "roles.manage",
  EMPLOYEES_VIEW: "employees.view",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_UPDATE: "employees.update",
  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_MANAGE: "attendance.manage",
  LEAVE_VIEW: "leave.view",
  LEAVE_MANAGE: "leave.manage",
  PAYROLL_VIEW: "payroll.view",
  PAYROLL_MANAGE: "payroll.manage",
  EXPENSES_VIEW: "expenses.view",
  EXPENSES_CREATE: "expenses.create",
  EXPENSES_MANAGE: "expenses.manage",
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",
  AUDIT_LOGS_VIEW: "audit_logs.view",
  NOTIFICATIONS_VIEW: "notifications.view",
  POS_USE: "pos.use",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_ROLES: Record<string, string[]> = {
  "Business Owner": Object.values(PERMISSIONS),
  Admin: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_TRANSFER,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.SALES_REFUND,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.PURCHASES_CREATE,
    PERMISSIONS.PURCHASES_RECEIVE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.SUPPLIERS_CREATE,
    PERMISSIONS.SUPPLIERS_UPDATE,
    PERMISSIONS.STORES_VIEW,
    PERMISSIONS.STORES_CREATE,
    PERMISSIONS.STORES_UPDATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_UPDATE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_MANAGE,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_MANAGE,
    PERMISSIONS.EXPENSES_VIEW,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.POS_USE,
  ],
  Manager: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.SALES_REFUND,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.PURCHASES_CREATE,
    PERMISSIONS.PURCHASES_RECEIVE,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.POS_USE,
  ],
  Cashier: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.POS_USE,
  ],
  "Inventory Manager": [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_TRANSFER,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.SUPPLIERS_CREATE,
    PERMISSIONS.SUPPLIERS_UPDATE,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.PURCHASES_RECEIVE,
  ],
  "HR Manager": [
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_UPDATE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_MANAGE,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_MANAGE,
  ],
  Employee: [PERMISSIONS.POS_USE],
};
