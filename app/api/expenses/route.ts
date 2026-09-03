import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "expenses.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    const storeId = searchParams.get("storeId");
    if (storeId) query.storeId = storeId;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query),
    ]);

    return apiPaginated(expenses, total, page, limit);
  } catch (error) {
    console.error("Expenses GET error:", error);
    return apiError("Failed to fetch expenses", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "expenses.create")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { amount, description, date, categoryId, storeId } = body;

    if (!amount || !description || !date) {
      return apiError("Amount, description, and date are required");
    }

    const expense = await Expense.create({
      businessId: ctx.businessId,
      amount: Number(amount),
      description,
      date: new Date(date),
      categoryId,
      storeId,
      createdBy: ctx.user.id,
    });

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "CREATE",
      resource: "expense",
      resourceId: String(expense._id),
      metadata: { amount, description },
    });

    return apiSuccess(expense, 201);
  } catch (error) {
    console.error("Expenses POST error:", error);
    return apiError("Failed to create expense", 500);
  }
}
