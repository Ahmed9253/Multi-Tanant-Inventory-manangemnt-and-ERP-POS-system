import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Supplier } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "suppliers.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(query),
    ]);

    return apiPaginated(suppliers, total, page, limit);
  } catch (error) {
    console.error("Suppliers GET error:", error);
    return apiError("Failed to fetch suppliers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "suppliers.create")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { name, company, phone, email, address, taxNumber, notes } = body;

    if (!name) return apiError("Name is required");

    const supplier = await Supplier.create({
      businessId: ctx.businessId,
      name,
      company,
      phone,
      email,
      address,
      taxNumber,
      notes,
    });

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "CREATE",
      resource: "supplier",
      resourceId: String(supplier._id),
      metadata: { name },
    });

    return apiSuccess(supplier, 201);
  } catch (error) {
    console.error("Suppliers POST error:", error);
    return apiError("Failed to create supplier", 500);
  }
}
