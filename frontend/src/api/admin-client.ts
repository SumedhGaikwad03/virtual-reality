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
    response = await fetch(`${API_BASE_URL}${path}`, {
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
    throw new AdminApiError("Admin request failed", response.status);
  }

  return (await response.json()) as T;
}
