/**
 * Development seed script.
 * Creates a demo tenant, users, stores, products, inventory, customers, suppliers, and sales.
 * Run: node scripts/seed.mjs
 */

import mongoose from "mongoose";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const collections = [
  "businesses",
  "users",
  "memberships",
  "sessions",
  "roles",
  "stores",
  "categories",
  "products",
  "inventories",
  "inventorymovements",
  "customers",
  "suppliers",
  "sales",
  "purchases",
  "employees",
  "departments",
  "attendances",
  "leaves",
  "payrolls",
  "expenses",
  "auditlogs",
  "notifications",
];

async function seed() {
  const conn = await mongoose.connect(MONGODB_URI);
  const db = conn.connection.db;

  console.log("Connected to MongoDB");

  for (const name of collections) {
    const existing = await db.collection(name).countDocuments({});
    if (existing > 0) {
      console.log(`Collection ${name} already has data (${existing}). Skipping seed of that collection.`);
    }
  }

  const usersColl = db.collection("users");
  const existingUser = await usersColl.countDocuments({});
  if (existingUser > 0) {
    console.log("Seed data already exists. Run `node scripts/clear-seed.mjs` first to reseed.");
    process.exit(0);
  }

  // Password hash for "Password123!" using bcryptjs synchronously
  const bcrypt = (await import("bcryptjs")).default;
  const hash = bcrypt.hashSync("Password123!", 12);

  const now = new Date();

  // Business
  const business = await db.collection("businesses").insertOne({
    name: "Demo Retail",
    legalName: "Demo Retail LLC",
    email: "owner@demoretail.com",
    phone: "+1-555-0100",
    address: "123 Main Street",
    city: "Springfield",
    state: "IL",
    country: "US",
    currency: "USD",
    timezone: "America/Chicago",
    taxRate: 8.5,
    taxName: "Sales Tax",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  // Users
  const owner = await usersColl.insertOne({
    name: "Demo Owner",
    email: "owner@demoretail.com",
    password: hash,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  const manager = await usersColl.insertOne({
    name: "Store Manager",
    email: "manager@demoretail.com",
    password: hash,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  const cashier = await usersColl.insertOne({
    name: "Cashier One",
    email: "cashier@demoretail.com",
    password: hash,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  const invManager = await usersColl.insertOne({
    name: "Inventory Manager",
    email: "inventory@demoretail.com",
    password: hash,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  const hrManager = await usersColl.insertOne({
    name: "HR Manager",
    email: "hr@demoretail.com",
    password: hash,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  const bid = business.insertedId;
  const ownerId = owner.insertedId;
  const managerId = manager.insertedId;
  const cashierId = cashier.insertedId;
  const invManagerId = invManager.insertedId;
  const hrManagerId = hrManager.insertedId;

  // Roles with permissions
  const allPermissions = [
    "products.view", "products.create", "products.update", "products.delete",
    "categories.view", "categories.manage",
    "inventory.view", "inventory.adjust", "inventory.transfer",
    "sales.view", "sales.create", "sales.update", "sales.refund",
    "purchases.view", "purchases.create", "purchases.receive",
    "customers.view", "customers.create", "customers.update",
    "suppliers.view", "suppliers.create", "suppliers.update",
    "stores.view", "stores.create", "stores.update", "stores.delete",
    "users.view", "users.invite", "users.manage",
    "roles.view", "roles.manage",
    "employees.view", "employees.create", "employees.update",
    "attendance.view", "attendance.manage",
    "leave.view", "leave.manage",
    "payroll.view", "payroll.manage",
    "expenses.view", "expenses.create", "expenses.manage",
    "reports.view", "reports.export",
    "settings.view", "settings.manage",
    "audit_logs.view",
    "notifications.view",
    "pos.use",
  ];

  const cashierPerms = ["products.view", "sales.view", "sales.create", "customers.view", "customers.create", "pos.use"];
  const managerPerms = allPermissions.filter(
    (p) => !["users.manage", "roles.manage", "settings.manage", "audit_logs.view", "payroll.manage"].includes(p)
  );
  const invPerms = ["products.view", "products.create", "products.update", "categories.view", "categories.manage", "inventory.view", "inventory.adjust", "inventory.transfer", "suppliers.view", "suppliers.create", "suppliers.update", "purchases.view", "purchases.create", "purchases.receive"];
  const hrPerms = ["employees.view", "employees.create", "employees.update", "attendance.view", "attendance.manage", "leave.view", "leave.manage", "payroll.view", "payroll.manage"];

  const roleOwner = await db.collection("roles").insertOne({ businessId: bid, name: "Business Owner", description: "Full access", permissions: allPermissions, isDefault: true, createdAt: now, updatedAt: now });
  const roleAdmin = await db.collection("roles").insertOne({ businessId: bid, name: "Admin", description: "Administrator", permissions: allPermissions, isDefault: true, createdAt: now, updatedAt: now });
  const roleManager = await db.collection("roles").insertOne({ businessId: bid, name: "Manager", description: "Store manager", permissions: managerPerms, isDefault: true, createdAt: now, updatedAt: now });
  const roleCashier = await db.collection("roles").insertOne({ businessId: bid, name: "Cashier", description: "Point of sale", permissions: cashierPerms, isDefault: true, createdAt: now, updatedAt: now });
  const roleInv = await db.collection("roles").insertOne({ businessId: bid, name: "Inventory Manager", description: "Inventory control", permissions: invPerms, isDefault: true, createdAt: now, updatedAt: now });
  const roleHr = await db.collection("roles").insertOne({ businessId: bid, name: "HR Manager", description: "Human resources", permissions: hrPerms, isDefault: true, createdAt: now, updatedAt: now });

  // Stores
  const storeMain = await db.collection("stores").insertOne({
    businessId: bid, name: "Main Branch", code: "MAIN",
    address: "123 Main Street", city: "Springfield", phone: "+1-555-0101",
    status: "active", settings: { currency: "USD", taxRate: 8.5, lowStockThreshold: 10 },
    createdAt: now, updatedAt: now,
  });
  const storeDowntown = await db.collection("stores").insertOne({
    businessId: bid, name: "Downtown Branch", code: "DTN",
    address: "456 Market Ave", city: "Springfield", phone: "+1-555-0102",
    status: "active", settings: { currency: "USD", taxRate: 8.5, lowStockThreshold: 10 },
    createdAt: now, updatedAt: now,
  });
  const mainId = storeMain.insertedId;
  const dtnId = storeDowntown.insertedId;

  // Memberships
  const roles = {
    owner: roleOwner.insertedId,
    admin: roleAdmin.insertedId,
    manager: roleManager.insertedId,
    cashier: roleCashier.insertedId,
    inv: roleInv.insertedId,
    hr: roleHr.insertedId,
  };

  await db.collection("memberships").insertMany([
    { userId: ownerId, businessId: bid, roleId: roles.owner, storeIds: [mainId, dtnId], status: "active", joinedAt: now },
    { userId: managerId, businessId: bid, roleId: roles.manager, storeIds: [mainId, dtnId], status: "active", joinedAt: now },
    { userId: cashierId, businessId: bid, roleId: roles.cashier, storeIds: [mainId], status: "active", joinedAt: now },
    { userId: invManagerId, businessId: bid, roleId: roles.inv, storeIds: [mainId, dtnId], status: "active", joinedAt: now },
    { userId: hrManagerId, businessId: bid, roleId: roles.hr, storeIds: [mainId], status: "active", joinedAt: now },
  ]);

  // Departments
  const deptSales = await db.collection("departments").insertOne({ businessId: bid, name: "Sales", description: "Sales team", status: "active", createdAt: now, updatedAt: now });
  const deptOps = await db.collection("departments").insertOne({ businessId: bid, name: "Operations", description: "Operations", status: "active", createdAt: now, updatedAt: now });
  const deptHr = await db.collection("departments").insertOne({ businessId: bid, name: "HR", description: "Human resources", status: "active", createdAt: now, updatedAt: now });

  // Categories
  const catElec = await db.collection("categories").insertOne({ businessId: bid, name: "Electronics", description: "Electronic devices", status: "active", createdAt: now, updatedAt: now });
  const catCloth = await db.collection("categories").insertOne({ businessId: bid, name: "Clothing", description: "Apparel", status: "active", createdAt: now, updatedAt: now });
  const catHome = await db.collection("categories").insertOne({ businessId: bid, name: "Home", description: "Home goods", status: "active", createdAt: now, updatedAt: now });
  const catFood = await db.collection("categories").insertOne({ businessId: bid, name: "Food & Beverage", description: "Food items", status: "active", createdAt: now, updatedAt: now });

  // Products
  const products = [
    { name: "Wireless Mouse", sku: "ELC-001", categoryId: catElec.insertedId, unit: "pcs", costPrice: 12, sellingPrice: 25, taxRate: 8.5, minimumStock: 10, maximumStock: 100, status: "active" },
    { name: "Mechanical Keyboard", sku: "ELC-002", categoryId: catElec.insertedId, unit: "pcs", costPrice: 45, sellingPrice: 89, taxRate: 8.5, minimumStock: 5, maximumStock: 50, status: "active" },
    { name: "USB-C Cable 2m", sku: "ELC-003", categoryId: catElec.insertedId, unit: "pcs", costPrice: 3, sellingPrice: 9, taxRate: 8.5, minimumStock: 20, maximumStock: 200, status: "active" },
    { name: "Cotton T-Shirt (White)", sku: "CLT-001", categoryId: catCloth.insertedId, unit: "pcs", costPrice: 8, sellingPrice: 20, taxRate: 8.5, minimumStock: 15, maximumStock: 150, status: "active" },
    { name: "Denim Jeans", sku: "CLT-002", categoryId: catCloth.insertedId, unit: "pcs", costPrice: 22, sellingPrice: 50, taxRate: 8.5, minimumStock: 10, maximumStock: 80, status: "active" },
    { name: "Ceramic Mug Set", sku: "HOM-001", categoryId: catHome.insertedId, unit: "set", costPrice: 15, sellingPrice: 35, taxRate: 8.5, minimumStock: 8, maximumStock: 60, status: "active" },
    { name: "Desk Lamp", sku: "HOM-002", categoryId: catHome.insertedId, unit: "pcs", costPrice: 18, sellingPrice: 40, taxRate: 8.5, minimumStock: 5, maximumStock: 40, status: "active" },
    { name: "Coffee Beans 1kg", sku: "FOD-001", categoryId: catFood.insertedId, unit: "bag", costPrice: 9, sellingPrice: 22, taxRate: 8.5, minimumStock: 20, maximumStock: 120, status: "active" },
    { name: "Olive Oil 500ml", sku: "FOD-002", categoryId: catFood.insertedId, unit: "bottle", costPrice: 6, sellingPrice: 15, taxRate: 8.5, minimumStock: 15, maximumStock: 100, status: "active" },
    { name: "Bluetooth Speaker", sku: "ELC-004", categoryId: catElec.insertedId, unit: "pcs", costPrice: 30, sellingPrice: 65, taxRate: 8.5, minimumStock: 5, maximumStock: 50, status: "active" },
  ];

  const productIds = [];
  for (const p of products) {
    const res = await db.collection("products").insertOne({ businessId: bid, ...p, hasVariants: false, variants: [], images: [], createdAt: now, updatedAt: now });
    productIds.push(res.insertedId);
  }

  // Inventory (main store)
  const mainQty = [50, 20, 120, 40, 25, 30, 15, 60, 45, 18];
  for (let i = 0; i < productIds.length; i++) {
    await db.collection("inventories").insertOne({
      businessId: bid, storeId: mainId, productId: productIds[i],
      quantity: mainQty[i], reservedQuantity: 0, incomingQuantity: 0,
      createdAt: now, updatedAt: now,
    });
    await db.collection("inventorymovements").insertOne({
      businessId: bid, storeId: mainId, productId: productIds[i],
      quantity: mainQty[i], type: "OPENING_BALANCE", userId: ownerId, createdAt: now,
    });
  }

  // Inventory (downtown store) - smaller
  const dtnQty = [15, 8, 40, 12, 10, 10, 5, 20, 15, 6];
  for (let i = 0; i < productIds.length; i++) {
    await db.collection("inventories").insertOne({
      businessId: bid, storeId: dtnId, productId: productIds[i],
      quantity: dtnQty[i], reservedQuantity: 0, incomingQuantity: 0,
      createdAt: now, updatedAt: now,
    });
  }

  // Customers
  const customers = [
    { name: "John Smith", phone: "+1-555-0201", email: "john@example.com", status: "active" },
    { name: "Sarah Johnson", phone: "+1-555-0202", email: "sarah@example.com", status: "active" },
    { name: "Michael Brown", phone: "+1-555-0203", email: "michael@example.com", status: "active" },
    { name: "Emily Davis", phone: "+1-555-0204", email: "emily@example.com", status: "active" },
  ];
  const customerIds = [];
  for (const c of customers) {
    const res = await db.collection("customers").insertOne({ businessId: bid, ...c, address: "Springfield", notes: "Seed customer", createdAt: now, updatedAt: now });
    customerIds.push(res.insertedId);
  }

  // Suppliers
  const suppliers = [
    { name: "Tech Supply Co", company: "Tech Supply Co", email: "sales@techsupply.com", phone: "+1-555-0301", status: "active" },
    { name: "Apparel Wholesale", company: "Apparel Wholesale LLC", email: "orders@apparelwholesale.com", phone: "+1-555-0302", status: "active" },
    { name: "Home Goods Direct", company: "Home Goods Direct Inc", email: "buy@homegoodsdirect.com", phone: "+1-555-0303", status: "active" },
    { name: "Fresh Foods Distributor", company: "Fresh Foods Ltd", email: "contact@freshfoods.com", phone: "+1-555-0304", status: "active" },
  ];
  const supplierIds = [];
  for (const s of suppliers) {
    const res = await db.collection("suppliers").insertOne({ businessId: bid, ...s, address: "Springfield", notes: "Seed supplier", createdAt: now, updatedAt: now });
    supplierIds.push(res.insertedId);
  }

  // Employees
  const employees = [
    { employeeNumber: "EMP0001", firstName: "Demo", lastName: "Owner", email: "owner@demoretail.com", position: "Owner", employmentStatus: "active", employmentType: "full_time", hireDate: new Date("2024-01-15"), storeId: mainId, departmentId: deptSales.insertedId, baseSalary: 60000 },
    { employeeNumber: "EMP0002", firstName: "Store", lastName: "Manager", email: "manager@demoretail.com", position: "Store Manager", employmentStatus: "active", employmentType: "full_time", hireDate: new Date("2024-02-01"), storeId: mainId, departmentId: deptSales.insertedId, baseSalary: 45000 },
    { employeeNumber: "EMP0003", firstName: "Cashier", lastName: "One", email: "cashier@demoretail.com", position: "Cashier", employmentStatus: "active", employmentType: "full_time", hireDate: new Date("2024-03-10"), storeId: mainId, departmentId: deptOps.insertedId, baseSalary: 30000 },
    { employeeNumber: "EMP0004", firstName: "Inventory", lastName: "Manager", email: "inventory@demoretail.com", position: "Inventory Manager", employmentStatus: "active", employmentType: "full_time", hireDate: new Date("2024-02-20"), storeId: mainId, departmentId: deptOps.insertedId, baseSalary: 40000 },
    { employeeNumber: "EMP0005", firstName: "HR", lastName: "Manager", email: "hr@demoretail.com", position: "HR Manager", employmentStatus: "active", employmentType: "full_time", hireDate: new Date("2024-04-05"), storeId: mainId, departmentId: deptHr.insertedId, baseSalary: 42000 },
  ];
  const employeeIds = [];
  for (const e of employees) {
    const res = await db.collection("employees").insertOne({ businessId: bid, ...e, createdAt: now, updatedAt: now });
    employeeIds.push(res.insertedId);
  }

  // A couple of sales
  const sale1Items = [
    { productId: productIds[0], name: "Wireless Mouse", sku: "ELC-001", quantity: 2, unitPrice: 25, costPrice: 12, discountAmount: 0, taxRate: 8.5, taxAmount: 4.25, total: 54.25 },
    { productId: productIds[3], name: "Cotton T-Shirt (White)", sku: "CLT-001", quantity: 1, unitPrice: 20, costPrice: 8, discountAmount: 0, taxRate: 8.5, taxAmount: 1.7, total: 21.7 },
  ];
  const sale2Items = [
    { productId: productIds[6], name: "Desk Lamp", sku: "HOM-002", quantity: 1, unitPrice: 40, costPrice: 18, discountAmount: 0, taxRate: 8.5, taxAmount: 3.4, total: 43.4 },
  ];

  await db.collection("sales").insertMany([
    {
      businessId: bid, storeId: mainId, cashierId: cashierId, customerId: customerIds[0],
      receiptNumber: "RCP-000001", invoiceNumber: "INV-000001",
      items: sale1Items, subtotal: 70, discountAmount: 0, discountPercent: 0, taxAmount: 5.95, total: 75.95,
      payments: [{ method: "cash", amount: 75.95, receivedAt: now }],
      status: "completed", createdAt: now, updatedAt: now,
    },
    {
      businessId: bid, storeId: mainId, cashierId: cashierId, customerId: customerIds[1],
      receiptNumber: "RCP-000002", invoiceNumber: "INV-000002",
      items: sale2Items, subtotal: 40, discountAmount: 0, discountPercent: 0, taxAmount: 3.4, total: 43.4,
      payments: [{ method: "card", amount: 43.4, receivedAt: now }],
      status: "completed", createdAt: now, updatedAt: now,
    },
  ]);

  // Expenses
  await db.collection("expenses").insertMany([
    { businessId: bid, storeId: mainId, amount: 1500, description: "Rent - Main Branch", date: new Date(now.getFullYear(), now.getMonth(), 1), status: "approved", createdBy: ownerId, createdAt: now, updatedAt: now },
    { businessId: bid, storeId: mainId, amount: 320, description: "Utilities - Electricity", date: new Date(now.getFullYear(), now.getMonth(), 5), status: "approved", createdBy: managerId, createdAt: now, updatedAt: now },
    { businessId: bid, storeId: dtnId, amount: 800, description: "Rent - Downtown Branch", date: new Date(now.getFullYear(), now.getMonth(), 2), status: "approved", createdBy: ownerId, createdAt: now, updatedAt: now },
  ]);

  // Payroll
  for (const e of employees) {
    const baseSalary = e.baseSalary;
    const monthly = Math.round((baseSalary / 12) * 100) / 100;
    await db.collection("payrolls").insertOne({
      businessId: bid, employeeId: e.employeeNumber ? employeeIds[employees.indexOf(e)] : null,
      payPeriodStart: new Date(now.getFullYear(), now.getMonth(), 1),
      payPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      baseSalary: monthly, allowances: 0, deductions: 0, grossPay: monthly, netPay: monthly,
      status: "approved", createdAt: now, updatedAt: now,
    });
  }

  // Leave requests
  await db.collection("leaves").insertMany([
    { businessId: bid, employeeId: employeeIds[2], leaveType: "Annual Leave", startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), endDate: new Date(now.getFullYear(), now.getMonth() + 1, 3), reason: "Personal vacation", status: "pending", createdAt: now, updatedAt: now },
    { businessId: bid, employeeId: employeeIds[3], leaveType: "Sick Leave", startDate: new Date(now.getFullYear(), now.getMonth(), 10), endDate: new Date(now.getFullYear(), now.getMonth(), 10), reason: "Medical appointment", status: "approved", approvedBy: hrManagerId, approvedAt: now, createdAt: now, updatedAt: now },
  ]);

  // Audit logs
  await db.collection("auditlogs").insertMany([
    { businessId: bid, userId: ownerId, action: "SEED", resource: "business", resourceId: bid, metadata: { note: "Seed data created" }, createdAt: now },
    { businessId: bid, userId: ownerId, action: "CREATE", resource: "product", metadata: { count: productIds.length }, createdAt: now },
  ]);

  // Notifications
  await db.collection("notifications").insertMany([
    { businessId: bid, userId: ownerId, title: "Welcome to NovaSuite", message: "Your demo business has been set up. Explore the dashboard!", type: "success", read: false, createdAt: now },
    { businessId: bid, userId: managerId, title: "Low stock alert", message: "Desk Lamp is running low at Main Branch.", type: "warning", read: false, createdAt: now },
  ]);

  console.log("\n=== SEED COMPLETE ===");
  console.log("Business:  Demo Retail");
  console.log("Stores:    Main Branch, Downtown Branch");
  console.log("URLs:");
  console.log("  owner@demoretail.com      / Password123!");
  console.log("  manager@demoretail.com    / Password123!");
  console.log("  cashier@demoretail.com    / Password123!");
  console.log("  inventory@demoretail.com  / Password123!");
  console.log("  hr@demoretail.com         / Password123!");

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
