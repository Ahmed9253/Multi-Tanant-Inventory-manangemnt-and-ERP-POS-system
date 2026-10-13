export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Base URL for every API request.
 *
 * - Local dev and Vercel (same origin): leave `VITE_API_BASE_URL` empty so
 *   requests go to `/api/...` and are handled by the Vite proxy or the
 *   platform rewrite.
 * - Split frontend/backend: set `VITE_API_BASE_URL` to the API origin, e.g.
 *   `https://worknest-api.vercel.app`.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/** Every API path lives here so fetch calls never hardcode URLs. */
export const endpoints = {
  health: "/api/health",
  auth: {
    login: "/api/auth/login",
  },
  products: {
    list: "/api/products",
    create: "/api/products",
    update: (id: string) => `/api/products/${id}`,
    remove: (id: string) => `/api/products/${id}`,
  },
  branches: {
    list: "/api/branches",
    create: "/api/branches",
    update: (id: string) => `/api/branches/${id}`,
    remove: (id: string) => `/api/branches/${id}`,
  },
  sales: {
    list: "/api/sales",
    create: "/api/sales",
  },
  dashboard: "/api/dashboard",
  reports: {
    monthly: "/api/reports/monthly",
  },
  customers: {
    list: "/api/customers",
    create: "/api/customers",
    update: (id: string) => `/api/customers/${id}`,
    remove: (id: string) => `/api/customers/${id}`,
  },
  settings: "/api/settings",
  employees: {
    list: "/api/employees",
    create: "/api/employees",
    update: (id: string) => `/api/employees/${id}`,
    remove: (id: string) => `/api/employees/${id}`,
  },
  payroll: {
    list: "/api/payroll",
    create: "/api/payroll",
    update: (id: string) => `/api/payroll/${id}`,
    remove: (id: string) => `/api/payroll/${id}`,
    generate: "/api/payroll/generate",
  },
} as const;

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(buildUrl(path));
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function sendJson<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T | null> {
  try {
    const res = await fetch(buildUrl(path), {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) return null;
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function sendJsonDetailed<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(buildUrl(path), {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const payload = (await res.json()) as { error?: string };
        if (payload.error) message = payload.error;
      } catch {
        // response body is not JSON
      }
      return { data: null, error: message };
    }
    if (res.status === 204) return { data: null, error: null };
    const data = (await res.json()) as T;
    return { data, error: null };
  } catch {
    return { data: null, error: "Server not reachable. Is the backend running?" };
  }
}

export const api = {
  get: getJson,
  post: <T>(path: string, body: unknown) => sendJson<T>(path, "POST", body),
  patch: <T>(path: string, body: unknown) => sendJson<T>(path, "PATCH", body),
  delete: (path: string) => sendJson<null>(path, "DELETE"),
  postDetail: <T>(path: string, body: unknown) =>
    sendJsonDetailed<T>(path, "POST", body),
};
