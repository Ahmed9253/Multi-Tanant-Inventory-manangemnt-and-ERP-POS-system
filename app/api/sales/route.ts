import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sale } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "sales.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const storeId = searchParams.get("storeId") || "";
    const status = searchParams.get("status") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (storeId) query.storeId = storeId;
    if (status) query.status = status;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("customerId", "name phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    return apiPaginated(sales, total, page, limit);
  } catch (error) {
    console.error("Sales GET error:", error);
    return apiError("Failed to fetch sales", 500);
  }
}
