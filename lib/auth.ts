import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import { User, Membership, Session, Role } from "@/models";
import { SESSION_DURATION_MS } from "@/config/constants";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "nova-suite-default-secret-change-in-production"
);

const SESSION_COOKIE = "nova_session";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthContext {
  user: AuthUser;
  businessId: string;
  membershipId: string;
  roleId: string;
  permissions: string[];
  storeIds: string[];
}

export async function createToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, businessId: string): Promise<string> {
  await connectDB();
  const token = crypto.randomUUID();

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await Session.create({
    userId,
    businessId,
    token,
    expiresAt,
  });

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value || null;
}

export async function deleteSession(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await connectDB();
    await Session.deleteOne({ token });
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  await connectDB();

  const session = await Session.findOne({ token }).lean();
  if (!session || new Date(session.expiresAt) < new Date()) {
    if (session) await Session.deleteOne({ _id: session._id });
    return null;
  }

  const user = await User.findById(session.userId).lean();
  if (!user || user.status !== "active") return null;

    const membership = await Membership.findOne({
      userId: user._id,
      businessId: session.businessId,
      status: "active",
    }).lean() as unknown as {
      _id: unknown;
      roleId: unknown;
      storeIds: Array<{ toString: () => string }>;
    } | null;
    if (!membership) return null;

    const role = await Role.findById(membership.roleId).lean();
    if (!role) return null;

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      businessId: String(session.businessId),
      membershipId: String(membership._id),
      roleId: String(role._id),
      permissions: role.permissions,
      storeIds: membership.storeIds.map((s) => String(s)),  
    };
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    throw new Error("Unauthorized");
  }
  return ctx;
}

export function hasPermission(
  permissions: string[],
  required: string | string[]
): boolean {
  if (typeof required === "string") {
    return permissions.includes(required);
  }
  return required.every((p) => permissions.includes(p));
}
