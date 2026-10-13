import "dotenv/config";

function readOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongoUri:
    process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/worknest_pos",
  admin: {
    name: process.env.ADMIN_NAME ?? "Administrator",
    email: process.env.ADMIN_EMAIL ?? "admin@worknest.com",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
  },
  /** Optional comma separated list of allowed browser origins. Empty = allow all. */
  corsOrigins: readOrigins(process.env.CLIENT_ORIGIN),
};

export const isProduction = env.nodeEnv === "production";

export const serverConfig = {
  isProduction,
  env: env.nodeEnv,
  port: env.port,
};
