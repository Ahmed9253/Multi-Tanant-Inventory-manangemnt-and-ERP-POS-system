import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tillora_pos";

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
const Product = mongoose.model("Product", productSchema);
const Sale = mongoose.model("Sale", saleSchema);
const Branch = mongoose.model("Branch", branchSchema);
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

async function start() {
  await mongoose.connect(mongoUri);
  await prepareProductIndexes();
  await Setting.updateOne(
    { key: "firstUseAt" },
    { $setOnInsert: { key: "firstUseAt", value: new Date() } },
    { upsert: true },
  );
  app.listen(port, () =>
    console.log(`Tillora POS API running on http://localhost:${port}`),
  );
}

start().catch((error) => {
  console.error("Could not start API:", error.message);
  process.exit(1);
});
