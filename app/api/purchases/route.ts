import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Purchase } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "purchases.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const status = searchParams.get("status") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (status) query.status = status;

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate("supplierId", "name company")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Purchase.countDocuments(query),
    ]);

    return apiPaginated(purchases, total, page, limit);
  } catch (error) {
    console.error("Purchases GET error:", error);
    return apiError("Failed to fetch purchases", 500);
  }
}
