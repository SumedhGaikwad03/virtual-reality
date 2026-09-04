import { API_BASE_URL } from "./config";
import { adminRequest } from "./admin-client";
import { getAccessToken } from "../auth/auth-storage";
import type { AdminAccount, AdminLoginResponse, AdminRole } from "../auth/types";

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

export type CreateAdminAccountInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

export type CreatedAdminAccountResponse = {
  data: {
    id: string;
    email: string;
    name: string | null;
    role: AdminRole;
    isActive: boolean;
    createdAt: string;
  };
};

export async function createAdminAccount(
  input: CreateAdminAccountInput,
): Promise<CreatedAdminAccountResponse> {
  const accessToken = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/admin/auth/admins`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
  } catch {
    throw new AdminAuthApiError("Admin account creation request failed", null);
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event("virtual-reality.admin-unauthorized"));
    throw new AdminAuthApiError("Admin authentication required", 401);
  }

  if (response.status === 409) {
    throw new AdminAuthApiError("An administrator account with this email already exists", 409);
  }

  if (!response.ok) {
    let errorMessage = "Failed to create administrator account";
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) {
        errorMessage = errBody.error.message;
      }
    } catch {
      // Use fallback
    }
    throw new AdminAuthApiError(errorMessage, response.status);
  }

  return (await response.json()) as CreatedAdminAccountResponse;
}

export type UpdateAdminAccountInput = {
  name?: string | null;
  email?: string;
};

export type ChangeAdminPasswordInput = {
  currentPassword?: string;
  newPassword: string;
};

export function getAdminAccounts() {
  return adminRequest<{ data: AdminAccount[] }>("/admin/auth/accounts");
}

export function getAdminAccount(id: string) {
  return adminRequest<{ data: AdminAccount }>(`/admin/auth/accounts/${id}`);
}

export function updateAdminAccount(id: string, input: UpdateAdminAccountInput) {
  return adminRequest<{ data: AdminAccount }>(`/admin/auth/accounts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateAdminAccountStatus(id: string, isActive: boolean) {
  return adminRequest<{ data: AdminAccount }>(`/admin/auth/accounts/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
}

export function changeAdminAccountPassword(
  id: string,
  input: ChangeAdminPasswordInput,
) {
  return adminRequest<{ data: { message: string } }>(
    `/admin/auth/accounts/${id}/password`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}
