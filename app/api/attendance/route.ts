import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "attendance.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const employeeId = searchParams.get("employeeId") || "";
    const date = searchParams.get("date") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (employeeId) query.employeeId = employeeId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate("employeeId", "firstName lastName employeeNumber")
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    return apiPaginated(records, total, page, limit);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return apiError("Failed to fetch attendance", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "attendance.manage")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { employeeId, date, status, checkIn, checkOut, notes } = body;

    if (!employeeId || !date) {
      return apiError("Employee and date are required");
    }

    const attendance = await Attendance.findOneAndUpdate(
      {
        businessId: ctx.businessId,
        employeeId,
        date: new Date(date),
      },
      {
        status,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        notes,
      },
      { upsert: true, new: true }
    );

    return apiSuccess(attendance, 201);
  } catch (error) {
    console.error("Attendance POST error:", error);
    return apiError("Failed to record attendance", 500);
  }
}
