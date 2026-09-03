import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Employee } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
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
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (departmentId) query.departmentId = departmentId;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate("departmentId", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Employee.countDocuments(query),
    ]);

    return apiPaginated(employees, total, page, limit);
  } catch (error) {
    console.error("Employees GET error:", error);
    return apiError("Failed to fetch employees", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "employees.create")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const {
      firstName, lastName, email, phone, address, dateOfBirth,
      hireDate, departmentId, position, employmentType, baseSalary, storeId,
    } = body;

    if (!firstName || !lastName || !hireDate) {
      return apiError("First name, last name, and hire date are required");
    }

    const employeeCount = await Employee.countDocuments({
      businessId: ctx.businessId,
    });
    const employeeNumber = `EMP${String(employeeCount + 1).padStart(4, "0")}`;

    const employee = await Employee.create({
      businessId: ctx.businessId,
      employeeNumber,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      hireDate: new Date(hireDate),
      departmentId,
      position,
      employmentType: employmentType || "full_time",
      baseSalary,
      storeId,
    });

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "CREATE",
      resource: "employee",
      resourceId: String(employee._id),
      metadata: { employeeNumber, name: `${firstName} ${lastName}` },
    });

    return apiSuccess(employee, 201);
  } catch (error) {
    console.error("Employees POST error:", error);
    return apiError("Failed to create employee", 500);
  }
}
