import { API_BASE_URL } from "./config";
import type { AdminLoginResponse } from "../auth/types";

export class AdminAuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = "AdminAuthApiError";
  }
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminLoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AdminAuthApiError("Admin login request failed", null);
  }

  if (!response.ok) {
    throw new AdminAuthApiError(
      response.status === 401 ? "Invalid admin credentials" : "Admin login failed",
      response.status,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new AdminAuthApiError("Invalid admin login response", response.status);
  }

  if (!isAdminLoginResponse(body)) {
    throw new AdminAuthApiError("Invalid admin login response", response.status);
  }

  return body;
}

function isAdminLoginResponse(
  value: unknown,
): value is AdminLoginResponse {
  if (typeof value !== "object" || value === null || !("data" in value)) {
    return false;
  }

  const data = value.data;
  return (
    typeof data === "object" &&
    data !== null &&
    "accessToken" in data &&
    typeof data.accessToken === "string" &&
    data.accessToken.length > 0 &&
    "admin" in data &&
    typeof data.admin === "object" &&
    data.admin !== null
  );
}
