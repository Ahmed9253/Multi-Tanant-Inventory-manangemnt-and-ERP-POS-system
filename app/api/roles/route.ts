import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Role } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";
import { DEFAULT_ROLES } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "roles.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));

    const query = { businessId: ctx.businessId };

    const [roles, total] = await Promise.all([
      Role.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Role.countDocuments(query),
    ]);

    return apiPaginated(roles, total, page, limit);
  } catch (error) {
    console.error("Roles GET error:", error);
    return apiError("Failed to fetch roles", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "roles.manage")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name) return apiError("Name is required");

    const existing = await Role.findOne({
      businessId: ctx.businessId,
      name,
    });
    if (existing) return apiError("A role with this name already exists");

    const role = await Role.create({
      businessId: ctx.businessId,
      name,
      description,
      permissions: permissions || DEFAULT_ROLES[name] || [],
    });

    return apiSuccess(role, 201);
  } catch (error) {
    console.error("Roles POST error:", error);
    return apiError("Failed to create role", 500);
  }
}
