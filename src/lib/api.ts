export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function sendJson<T>(
  url: string,
  method: string,
  body?: unknown,
): Promise<T | null> {
  try {
    const res = await fetch(url, {
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
  url: string,
  method: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) message = body.error;
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
  post: <T>(url: string, body: unknown) => sendJson<T>(url, "POST", body),
  patch: <T>(url: string, body: unknown) => sendJson<T>(url, "PATCH", body),
  delete: (url: string) => sendJson<null>(url, "DELETE"),
  postDetail: <T>(url: string, body: unknown) =>
    sendJsonDetailed<T>(url, "POST", body),
};
