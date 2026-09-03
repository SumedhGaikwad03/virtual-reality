import type { AdminUser } from "./types";

const AUTH_TOKEN_KEY = "virtual-reality.admin.access-token";
const AUTH_ADMIN_KEY = "virtual-reality.admin.user";

export function getAccessToken() {
  const accessToken = window.localStorage.getItem(AUTH_TOKEN_KEY);

  if (!accessToken || isExpiredOrMalformed(accessToken)) {
    if (accessToken) {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_ADMIN_KEY);
    }
    return null;
  }

  return accessToken;
}

function isExpiredOrMalformed(accessToken: string) {
  try {
    const parts = accessToken.split(".");
    if (parts.length !== 3 || !parts[1]) return true;

    const payload = parts[1];

    const claims = JSON.parse(
      window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: unknown };

    return typeof claims.exp === "number" && claims.exp <= Date.now() / 1000;
  } catch {
    // Clear syntactically malformed local credentials; signature and authorization remain server responsibilities.
    return true;
  }
}

export function setAccessToken(accessToken: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
}

export function getAdminUser(): AdminUser | null {
  const serialized = window.localStorage.getItem(AUTH_ADMIN_KEY);
  if (!serialized) return null;

  try {
    const value = JSON.parse(serialized) as Partial<AdminUser>;
    if (
      typeof value.id !== "string" ||
      typeof value.email !== "string" ||
      (value.name !== null && typeof value.name !== "string") ||
      typeof value.isActive !== "boolean"
    ) {
      return null;
    }
    return value as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminUser(admin: AdminUser) {
  window.localStorage.setItem(AUTH_ADMIN_KEY, JSON.stringify(admin));
}

export function clearAccessToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_ADMIN_KEY);
}
