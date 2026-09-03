import { getAuthContext } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return apiError("Not authenticated", 401);
    }
    return apiSuccess(ctx);
  } catch {
    return apiError("Failed to get user", 500);
  }
}
