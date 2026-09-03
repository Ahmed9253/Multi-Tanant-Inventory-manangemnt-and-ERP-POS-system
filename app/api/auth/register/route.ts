import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Business, Membership, Role, Store } from "@/models";
import { createToken, createSession, setSessionCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { registerSchema } from "@/lib/validators";
import { DEFAULT_ROLES } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Validation failed");
    }

    await connectDB();

    const { name, email, password, businessName } = parsed.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return apiError("An account with this email already exists");
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const business = await Business.create({
      name: businessName,
      country: "US",
      currency: "USD",
      timezone: "UTC",
    });

    const store = await Store.create({
      businessId: business._id,
      name: "Main Branch",
      code: "MAIN",
    });

    const rolePermissions = DEFAULT_ROLES["Business Owner"] || [];
    const ownerRole = await Role.create({
      businessId: business._id,
      name: "Business Owner",
      description: "Full access to the business",
      permissions: rolePermissions,
      isDefault: true,
    });

    await Membership.create({
      userId: user._id,
      businessId: business._id,
      roleId: ownerRole._id,
      storeIds: [store._id],
      status: "active",
      joinedAt: new Date(),
    });

    const token = await createToken({
      sub: String(user._id),
      bid: String(business._id),
    });
    await createSession(String(user._id), String(business._id));
    await setSessionCookie(token);

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    return apiSuccess({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
      business: {
        id: String(business._id),
        name: business.name,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return apiError("Registration failed. Please try again.", 500);
  }
}
