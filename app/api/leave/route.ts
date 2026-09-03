import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Leave } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "leave.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const status = searchParams.get("status") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (status) query.status = status;

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .populate("employeeId", "firstName lastName employeeNumber")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Leave.countDocuments(query),
    ]);

    return apiPaginated(leaves, total, page, limit);
  } catch (error) {
    console.error("Leave GET error:", error);
    return apiError("Failed to fetch leave requests", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "leave.manage")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, reason } = body;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return apiError("Employee, leave type, start date, and end date are required");
    }

    const leave = await Leave.create({
      businessId: ctx.businessId,
      employeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });

    return apiSuccess(leave, 201);
  } catch (error) {
    console.error("Leave POST error:", error);
    return apiError("Failed to create leave request", 500);
  }
}
