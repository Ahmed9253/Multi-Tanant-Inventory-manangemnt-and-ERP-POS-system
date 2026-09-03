import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "audit_logs.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const resource = searchParams.get("resource") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (resource) query.resource = resource;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return apiPaginated(logs, total, page, limit);
  } catch (error) {
    console.error("AuditLogs GET error:", error);
    return apiError("Failed to fetch audit logs", 500);
  }
}
