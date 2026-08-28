/*
 * PURPOSE:
 * Admin developer API client.
 *
 * FLOW:
 * Admin Developer Management Flow
 *
 * RESPONSIBILITY:
 * Provides CRUD HTTP client functions (getDevelopers, getDeveloper, createDeveloper, updateDeveloper)
 * targeting the authenticated admin developer endpoints.
 */

import { adminRequest } from "./admin-client";
import type {
  AdminDeveloperInput,
  AdminDeveloperResponse,
  AdminDevelopersResponse,
} from "../types/admin-developer";

export function getDevelopers() {
  return adminRequest<AdminDevelopersResponse>("/admin/developers");
}

export function getDeveloper(id: string) {
  return adminRequest<AdminDeveloperResponse>(`/admin/developers/${id}`);
}

export function createDeveloper(payload: AdminDeveloperInput) {
  return adminRequest<AdminDeveloperResponse>("/admin/developers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateDeveloper(id: string, payload: Partial<AdminDeveloperInput>) {
  return adminRequest<AdminDeveloperResponse>(`/admin/developers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
