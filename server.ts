import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

export const app = express();
export default app;
const port = Number(process.env.PORT || 4000);
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/worknest_pos";

app.use(cors());
app.use(express.json());

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: String,
    price: Number,
    stock: Number,
    barcode: { type: String, unique: true, sparse: true },
    sku: String,
  },
  { timestamps: true },
);
const saleSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    discount: Number,
    total: Number,
    paymentMethod: String,
    customer: String,
  },
  { timestamps: true },
);
const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: String,
    manager: String,
    phone: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);
const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    notes: String,
  },
  { timestamps: true },
);
const appSettingsSchema = new mongoose.Schema({
  taxRate: { type: Number, default: 0.08 },
  storeName: { type: String, default: "WorkNest" },
  currency: { type: String, default: "$" },
});
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
const Product = mongoose.model("Product", productSchema);
const Sale = mongoose.model("Sale", saleSchema);
const Branch = mongoose.model("Branch", branchSchema);
const Customer = mongoose.model("Customer", customerSchema);
const AppSettings = mongoose.model("AppSettings", appSettingsSchema);
const Employee = mongoose.model("Employee", employeeSchema);
const Payroll = mongoose.model("Payroll", payrollSchema);
const settingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
});
const Setting = mongoose.model("Setting", settingSchema);

async function prepareProductIndexes() {
  const indexes = await Product.collection.listIndexes().toArray();
  const legacyIndex = indexes.find(
    (index) => index.name === "businessId_1_sku_1",
  );
  if (legacyIndex) {
    await Product.collection.dropIndex(legacyIndex.name);
    console.log("Removed legacy product index businessId_1_sku_1");
  }
}

app.get("/api/health", (_request, response) =>
  response.json({
    ok: true,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  }),
);
app.get("/api/products", async (_request, response) =>
  response.json(await Product.find().sort({ category: 1, name: 1 })),
);
app.post("/api/products", async (request, response) => {
  const product = await Product.create({
    name: request.body.name,
    category: request.body.category,
    price: Number(request.body.price),
    stock: Number(request.body.stock),
    barcode: request.body.barcode || undefined,
    sku: request.body.sku || `SKU-${Date.now().toString().slice(-6)}`,
  });
  response.status(201).json(product);
});
app.patch("/api/products/:id", async (request, response) => {
  const product = await Product.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true },
  );
  if (!product)
    return response.status(404).json({ error: "Product not found" });
  response.json(product);
});
app.delete("/api/products/:id", async (request, response) => {
  const product = await Product.findByIdAndDelete(request.params.id);
  if (!product)
    return response.status(404).json({ error: "Product not found" });
  response.status(204).send();
});
app.get("/api/branches", async (_request, response) =>
  response.json(await Branch.find().sort({ createdAt: 1 })),
);
app.post("/api/branches", async (request, response) => {
  const branch = await Branch.create({
    ...request.body,
    code: String(request.body.code).toUpperCase(),
  });
  response.status(201).json(branch);
});
app.patch("/api/branches/:id", async (request, response) => {
  const branch = await Branch.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true },
  );
  if (!branch) return response.status(404).json({ error: "Branch not found" });
  response.json(branch);
});
app.delete("/api/branches/:id", async (request, response) => {
  const branch = await Branch.findByIdAndDelete(request.params.id);
  if (!branch) return response.status(404).json({ error: "Branch not found" });
  response.status(204).send();
});
app.get("/api/sales", async (_request, response) =>
  response.json(await Sale.find().sort({ createdAt: -1 }).limit(12)),
);
app.get("/api/reports/monthly", async (_request, response) => {
  const firstUse = await Setting.findOne({ key: "firstUseAt" });
  const start = new Date(firstUse?.value || new Date());
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  const months: {
    month: string;
    bills: number;
    revenue: number;
    tax: number;
    discounts: number;
    items: number;
  }[] = [];
  for (
    const cursor = new Date(start);
    cursor <= now;
    cursor.setMonth(cursor.getMonth() + 1)
  ) {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + 1);
    const [summary] = await Sale.aggregate([
      { $match: { createdAt: { $gte: cursor, $lt: next } } },
      {
        $group: {
          _id: null,
          bills: { $sum: 1 },
          revenue: { $sum: "$total" },
          tax: { $sum: "$tax" },
          discounts: { $sum: "$discount" },
          items: { $sum: { $sum: "$items.quantity" } },
        },
      },
    ]);
    months.push({
      month: cursor.toLocaleString("en-US", { month: "long", year: "numeric" }),
      bills: summary?.bills || 0,
      revenue: summary?.revenue || 0,
      tax: summary?.tax || 0,
      discounts: summary?.discounts || 0,
      items: summary?.items || 0,
    });
  }
  response.json({ firstUseAt: start, months });
});
app.get("/api/dashboard", async (_request, response) => {
  const [sales, inventory, lowStock] = await Promise.all([
    Sale.aggregate([
      {
        $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } },
      },
    ]),
    Product.aggregate([
      {
        $group: {
          _id: null,
          value: { $sum: { $multiply: ["$price", "$stock"] } },
          units: { $sum: "$stock" },
        },
      },
    ]),
    Product.countDocuments({ stock: { $lte: 5 } }),
  ]);
  const daily = await Sale.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%b %d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 7 },
  ]);
  response.json({
    revenue: sales[0]?.revenue || 0,
    orders: sales[0]?.orders || 0,
    inventoryValue: inventory[0]?.value || 0,
    units: inventory[0]?.units || 0,
    lowStock,
    daily,
  });
});
app.post("/api/sales", async (request, response) => {
  const sale = await Sale.create(request.body);
  await Promise.all(
    (request.body.items || []).map(
      (item: { productId?: string; quantity: number }) =>
        item.productId
          ? Product.updateOne(
              { _id: item.productId },
              { $inc: { stock: -item.quantity } },
            )
          : null,
    ),
  );
  response.status(201).json(sale);
});

app.get("/api/customers", async (_request, response) =>
  response.json(await Customer.find().sort({ name: 1 })),
);
app.post("/api/customers", async (request, response) => {
  const customer = await Customer.create({
    name: request.body.name,
    email: request.body.email || undefined,
    phone: request.body.phone || undefined,
    notes: request.body.notes || undefined,
  });
  response.status(201).json(customer);
});
app.patch("/api/customers/:id", async (request, response) => {
  const customer = await Customer.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true },
  );
  if (!customer)
    return response.status(404).json({ error: "Customer not found" });
  response.json(customer);
});
app.delete("/api/customers/:id", async (request, response) => {
  const customer = await Customer.findByIdAndDelete(request.params.id);
  if (!customer)
    return response.status(404).json({ error: "Customer not found" });
  response.status(204).send();
});

app.get("/api/settings", async (_request, response) => {
  const [settings] = await AppSettings.find().limit(1);
  response.json(
    settings || { taxRate: 0.08, storeName: "WorkNest", currency: "$" },
  );
});
app.patch("/api/settings", async (request, response) => {
  const [existing] = await AppSettings.find().limit(1);
  const settings = existing
    ? await Object.assign(existing, request.body).save()
    : await AppSettings.create(request.body);
  response.json(settings);
});

app.post("/api/auth/login", async (request, response) => {
  const { email, password, loginType } = request.body;

  if (loginType === "admin" || (!loginType && email === process.env.ADMIN_EMAIL)) {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return response.json({
        id: "admin",
        name: "Administrator",
        email,
        role: "admin",
      });
    }
    if (loginType === "admin")
      return response.status(401).json({ error: "Invalid admin credentials" });
  }

  const employee = await Employee.findOne({
    email,
    password,
    status: "active",
  });
  if (!employee)
    return response.status(401).json({ error: "Invalid credentials" });

  if (loginType === "hr" && employee.role !== "hr")
    return response.status(403).json({ error: "Not an HR account" });

  response.json({
    id: employee._id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
  });
});

app.get("/api/employees", async (_request, response) =>
  response.json(await Employee.find().sort({ name: 1 })),
);
app.post("/api/employees", async (request, response) => {
  const employee = await Employee.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    phone: request.body.phone || undefined,
    role: request.body.role || "cashier",
    department: request.body.department || undefined,
    position: request.body.position || undefined,
    salary: Number(request.body.salary) || 0,
    hireDate: request.body.hireDate || new Date(),
    status: request.body.status || "active",
  });
  response.status(201).json(employee);
});
app.patch("/api/employees/:id", async (request, response) => {
  const employee = await Employee.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true },
  );
  if (!employee)
    return response.status(404).json({ error: "Employee not found" });
  response.json(employee);
});
app.delete("/api/employees/:id", async (request, response) => {
  const employee = await Employee.findByIdAndDelete(request.params.id);
  if (!employee)
    return response.status(404).json({ error: "Employee not found" });
  response.status(204).send();
});

app.get("/api/payroll", async (_request, response) =>
  response.json(await Payroll.find().sort({ createdAt: -1 })),
);
app.post("/api/payroll", async (request, response) => {
  const payroll = await Payroll.create({
    employeeId: request.body.employeeId,
    employeeName: request.body.employeeName,
    month: request.body.month,
    baseSalary: Number(request.body.baseSalary) || 0,
    bonus: Number(request.body.bonus) || 0,
    deductions: Number(request.body.deductions) || 0,
    netPay:
      (Number(request.body.baseSalary) || 0) +
      (Number(request.body.bonus) || 0) -
      (Number(request.body.deductions) || 0),
    status: "pending",
  });
  response.status(201).json(payroll);
});
app.patch("/api/payroll/:id", async (request, response) => {
  const existing = await Payroll.findById(request.params.id);
  if (!existing)
    return response.status(404).json({ error: "Payroll record not found" });
  const bonus =
    request.body.bonus !== undefined
      ? Number(request.body.bonus)
      : existing.bonus;
  const deductions =
    request.body.deductions !== undefined
      ? Number(request.body.deductions)
      : existing.deductions;
  const patch = {
    ...request.body,
    netPay: existing.baseSalary + bonus - deductions,
  };
  if (request.body.status === "paid" && !existing.paidAt)
    patch.paidAt = new Date();
  const payroll = await Payroll.findByIdAndUpdate(
    request.params.id,
    patch,
    { new: true },
  );
  response.json(payroll);
});
app.delete("/api/payroll/:id", async (request, response) => {
  const payroll = await Payroll.findByIdAndDelete(request.params.id);
  if (!payroll)
    return response.status(404).json({ error: "Payroll record not found" });
  response.status(204).send();
});
app.post("/api/payroll/generate", async (request, response) => {
  const month = request.body.month;
  const employees = await Employee.find({ status: "active" });
  const existing = await Payroll.find({ month });
  const existingIds = new Set(existing.map((p) => String(p.employeeId)));
  const created = [];
  for (const emp of employees) {
    if (existingIds.has(String(emp._id))) continue;
    created.push(
      await Payroll.create({
        employeeId: emp._id,
        employeeName: emp.name,
        month,
        baseSalary: emp.salary,
        bonus: 0,
        deductions: 0,
        netPay: emp.salary,
        status: "pending",
      }),
    );
  }
  response.status(201).json({ generated: created.length });
});

let dbConnectionPromise: Promise<void> | null = null;

export function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!dbConnectionPromise) {
    dbConnectionPromise = (async () => {
      await mongoose.connect(mongoUri);
      await prepareProductIndexes();
      await Setting.updateOne(
        { key: "firstUseAt" },
        { $setOnInsert: { key: "firstUseAt", value: new Date() } },
        { upsert: true },
      );
    })();
  }
  return dbConnectionPromise;
}

export async function start() {
  app.listen(port, () =>
    console.log(`WorkNest POS API running on http://localhost:${port}`),
  );
  connectDB().catch((error) => {
    console.warn(
      "Could not connect to MongoDB:",
      error?.message || error,
    );
    console.warn("Server is running but database features are unavailable.");
  });
}
