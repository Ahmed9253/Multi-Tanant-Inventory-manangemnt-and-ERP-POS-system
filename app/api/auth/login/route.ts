import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Membership, Session } from "@/models";
import { createToken, createSession, setSessionCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Validation failed");
    }

    await connectDB();

    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      return apiError("Invalid email or password");
    }

    if (user.status !== "active") {
      return apiError("Account is disabled. Please contact support.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return apiError("Invalid email or password");
    }

    const membership = await Membership.findOne({
      userId: user._id,
      status: "active",
    }).sort({ joinedAt: 1 });

    if (!membership) {
      return apiError("No business membership found. Please contact support.");
    }

    await Session.deleteMany({ userId: user._id });

    const token = await createToken({
      sub: String(user._id),
      bid: String(membership.businessId),
    });
    await createSession(String(user._id), String(membership.businessId));
    await setSessionCookie(token);

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    return apiSuccess({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
      businessId: String(membership.businessId),
    });
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Login failed. Please try again.", 500);
  }
}
