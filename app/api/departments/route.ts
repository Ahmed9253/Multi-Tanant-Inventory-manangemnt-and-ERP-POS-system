import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Department } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "employees.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));

    const query = { businessId: ctx.businessId };

    const [departments, total] = await Promise.all([
      Department.find(query)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Department.countDocuments(query),
    ]);

    return apiPaginated(departments, total, page, limit);
  } catch (error) {
    console.error("Departments GET error:", error);
    return apiError("Failed to fetch departments", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "employees.create")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { name, description } = body;

    if (!name) return apiError("Name is required");

    const department = await Department.create({
      businessId: ctx.businessId,
      name,
      description,
    });

    return apiSuccess(department, 201);
  } catch (error) {
    console.error("Departments POST error:", error);
    return apiError("Failed to create department", 500);
  }
}
