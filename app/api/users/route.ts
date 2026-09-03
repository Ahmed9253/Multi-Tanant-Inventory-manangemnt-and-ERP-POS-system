import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Membership } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "users.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));

    const memberships = await Membership.find({
      businessId: ctx.businessId,
    })
      .populate("userId", "name email avatar status lastLogin")
      .populate("roleId", "name")
      .sort({ joinedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Membership.countDocuments({
      businessId: ctx.businessId,
    });

    const users = memberships.map((m) => ({
      id: String((m.userId as unknown as { _id: string })._id),
      name: (m.userId as unknown as { name: string }).name,
      email: (m.userId as unknown as { email: string }).email,
      avatar: (m.userId as unknown as { avatar?: string }).avatar,
      status: (m.userId as unknown as { status: string }).status,
      lastLogin: (m.userId as unknown as { lastLogin?: Date }).lastLogin,
      role: (m.roleId as unknown as { name: string }).name,
      membershipId: String(m._id),
      joinedAt: m.joinedAt,
    }));

    return apiPaginated(users, total, page, limit);
  } catch (error) {
    console.error("Users GET error:", error);
    return apiError("Failed to fetch users", 500);
  }
}
