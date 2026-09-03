import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Payroll } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "payroll.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const status = searchParams.get("status") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (status) query.status = status;

    const [records, total] = await Promise.all([
      Payroll.find(query)
        .populate("employeeId", "firstName lastName employeeNumber")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payroll.countDocuments(query),
    ]);

    return apiPaginated(records, total, page, limit);
  } catch (error) {
    console.error("Payroll GET error:", error);
    return apiError("Failed to fetch payroll", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "payroll.manage")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { employeeId, payPeriodStart, payPeriodEnd, baseSalary, allowances, deductions, notes } = body;

    if (!employeeId || !payPeriodStart || !payPeriodEnd) {
      return apiError("Employee, pay period start, and pay period end are required");
    }

    const base = Number(baseSalary) || 0;
    const allow = Number(allowances) || 0;
    const deduct = Number(deductions) || 0;
    const gross = base + allow;
    const net = gross - deduct;

    const payroll = await Payroll.create({
      businessId: ctx.businessId,
      employeeId,
      payPeriodStart: new Date(payPeriodStart),
      payPeriodEnd: new Date(payPeriodEnd),
      baseSalary: base,
      allowances: allow,
      deductions: deduct,
      grossPay: gross,
      netPay: net,
      notes,
    });

    return apiSuccess(payroll, 201);
  } catch (error) {
    console.error("Payroll POST error:", error);
    return apiError("Failed to create payroll", 500);
  }
}
