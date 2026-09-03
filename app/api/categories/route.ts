import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "categories.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (search) query.name = { $regex: search, $options: "i" };

    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);

    return apiPaginated(categories, total, page, limit);
  } catch (error) {
    console.error("Categories GET error:", error);
    return apiError("Failed to fetch categories", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "categories.manage")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) return apiError("Name is required");

    const category = await Category.create({
      businessId: ctx.businessId,
      name,
      description,
      parentId,
    });

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "CREATE",
      resource: "category",
      resourceId: String(category._id),
      metadata: { name },
    });

    return apiSuccess(category, 201);
  } catch (error) {
    console.error("Categories POST error:", error);
    return apiError("Failed to create category", 500);
  }
}
