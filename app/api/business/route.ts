import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Business } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "settings.view")) return apiForbidden();

    await connectDB();
    const business = await Business.findById(ctx.businessId).lean();
    if (!business) return apiNotFound("Business not found");
    return apiSuccess(business);
  } catch (error) {
    console.error("Business GET error:", error);
    return apiError("Failed to fetch settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "settings.manage")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const business = await Business.findById(ctx.businessId);
    if (!business) return apiNotFound("Business not found");

    const fields = [
      "name", "legalName", "logo", "email", "phone", "address", "city", "state",
      "country", "currency", "timezone", "taxRate", "taxName",
    ];
    const changes: Record<string, unknown> = {};
    for (const key of fields) {
      if (body[key] !== undefined) {
        (business as unknown as Record<string, unknown>)[key] =
          key === "taxRate" ? Number(body[key]) : body[key];
        changes[key] = body[key];
      }
    }
    await business.save();

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "UPDATE",
      resource: "business",
      resourceId: String(business._id),
      metadata: { changes: Object.keys(changes) },
    });

    return apiSuccess(business);
  } catch (error) {
    console.error("Business PUT error:", error);
    return apiError("Failed to update settings", 500);
  }
}
