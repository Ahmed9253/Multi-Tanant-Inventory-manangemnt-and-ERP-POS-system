import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Store } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "stores.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));

    const query = { businessId: ctx.businessId };

    const [stores, total] = await Promise.all([
      Store.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Store.countDocuments(query),
    ]);

    return apiPaginated(stores, total, page, limit);
  } catch (error) {
    console.error("Stores GET error:", error);
    return apiError("Failed to fetch stores", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "stores.create")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { name, code, address, city, phone, email } = body;

    if (!name || !code) return apiError("Name and code are required");

    const existing = await Store.findOne({
      businessId: ctx.businessId,
      code,
    });
    if (existing) return apiError("A store with this code already exists");

    const store = await Store.create({
      businessId: ctx.businessId,
      name,
      code,
      address,
      city,
      phone,
      email,
    });

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "CREATE",
      resource: "store",
      resourceId: String(store._id),
      metadata: { name, code },
    });

    return apiSuccess(store, 201);
  } catch (error) {
    console.error("Stores POST error:", error);
    return apiError("Failed to create store", 500);
  }
}
