import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "customers.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    return apiPaginated(customers, total, page, limit);
  } catch (error) {
    console.error("Customers GET error:", error);
    return apiError("Failed to fetch customers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "customers.create")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { name, phone, email, address, notes } = body;

    if (!name) return apiError("Name is required");

    const customer = await Customer.create({
      businessId: ctx.businessId,
      name,
      phone,
      email,
      address,
      notes,
    });

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "CREATE",
      resource: "customer",
      resourceId: String(customer._id),
      metadata: { name },
    });

    return apiSuccess(customer, 201);
  } catch (error) {
    console.error("Customers POST error:", error);
    return apiError("Failed to create customer", 500);
  }
}
