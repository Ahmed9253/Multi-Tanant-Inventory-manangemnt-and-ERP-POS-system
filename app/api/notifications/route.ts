import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models";
import { getAuthContext } from "@/lib/auth";
import { apiError, apiPaginated, apiUnauthorized } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));

    const query = {
      businessId: ctx.businessId,
      userId: ctx.user.id,
    };

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return apiPaginated(notifications, total, page, limit);
  } catch (error) {
    console.error("Notifications GET error:", error);
    return apiError("Failed to fetch notifications", 500);
  }
}
