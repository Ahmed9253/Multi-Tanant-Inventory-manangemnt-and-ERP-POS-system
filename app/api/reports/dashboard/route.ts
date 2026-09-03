import { connectDB } from "@/lib/db";
import { Sale, Product, Inventory, Customer, Employee, Purchase, Expense } from "@/models";
import { getAuthContext } from "@/lib/auth";
import { apiError, apiSuccess, apiUnauthorized } from "@/lib/api-response";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();

    await connectDB();
    const bid = ctx.businessId;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalProducts,
      totalCustomers,
      totalEmployees,
      activeProducts,
      lowStockCount,
      salesThisMonth,
      salesToday,
      purchasesThisMonth,
      expensesThisMonth,
      recentSales,
    ] = await Promise.all([
      Product.countDocuments({ businessId: bid }),
      Customer.countDocuments({ businessId: bid }),
      Employee.countDocuments({ businessId: bid, employmentStatus: "active" }),
      Product.countDocuments({ businessId: bid, status: "active" }),
      Inventory.aggregate([
        { $match: { businessId: bid } },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        { $match: { $expr: { $lte: ["$quantity", "$product.minimumStock"] } } },
        { $count: "count" },
      ]),
      Sale.aggregate([
        { $match: { businessId: bid, createdAt: { $gte: startOfMonth }, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { businessId: bid, createdAt: { $gte: startOfDay }, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Purchase.aggregate([
        { $match: { businessId: bid, createdAt: { $gte: startOfMonth }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Expense.aggregate([
        { $match: { businessId: bid, date: { $gte: startOfMonth }, status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Sale.find({ businessId: bid, status: "completed" })
        .populate("customerId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return apiSuccess({
      totalProducts,
      activeProducts,
      totalCustomers,
      totalEmployees,
      lowStockCount: lowStockCount[0]?.count || 0,
      salesThisMonth: {
        total: salesThisMonth[0]?.total || 0,
        count: salesThisMonth[0]?.count || 0,
      },
      salesToday: {
        total: salesToday[0]?.total || 0,
        count: salesToday[0]?.count || 0,
      },
      purchasesThisMonth: purchasesThisMonth[0]?.total || 0,
      expensesThisMonth: expensesThisMonth[0]?.total || 0,
      recentSales,
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return apiError("Failed to fetch dashboard data", 500);
  }
}
