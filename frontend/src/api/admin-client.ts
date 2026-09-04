import { API_BASE_URL } from "./config";
import { clearAccessToken, getAccessToken } from "../auth/auth-storage";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export function buildAdminApiUrl(path: string): string {
  const base = (API_BASE_URL ?? "/api").replace(/\/+$/, "");
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api") && cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.slice(4);
  }
  return `${base}${cleanPath}`;
}

export async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = getAccessToken();
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(buildAdminApiUrl(path), {
      ...options,
      headers,
    });
  } catch {
    throw new AdminApiError("Admin request failed", null);
  }

  if (response.status === 401) {
    clearAccessToken();
    window.dispatchEvent(new Event("virtual-reality.admin-unauthorized"));
    throw new AdminApiError("Admin authentication required", 401);
  }

  if (!response.ok) {
    let errorMessage = "Admin request failed";
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) {
        errorMessage = errBody.error.message;
      } else if (errBody?.message) {
        errorMessage = errBody.message;
      }
    } catch {
      // Use fallback
    }
    throw new AdminApiError(errorMessage, response.status);
  }

  return (await response.json()) as T;
}
