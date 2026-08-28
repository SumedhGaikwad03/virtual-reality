/*
 * PURPOSE:
 * Admin project API client.
 *
 * FLOW:
 * Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Provides CRUD HTTP client functions (getProjects, getProject, createProject, updateProject)
 * targeting the authenticated admin project endpoints.
 */

import { adminRequest } from "./admin-client";
import type {
  AdminProjectInput,
  AdminProjectResponse,
  AdminProjectsResponse,
} from "../types/admin-project";

export function getProjects() {
  return adminRequest<AdminProjectsResponse>("/admin/projects");
}

export function getProject(id: string) {
  return adminRequest<AdminProjectResponse>(`/admin/projects/${id}`);
}

export function createProject(payload: AdminProjectInput) {
  return adminRequest<AdminProjectResponse>("/admin/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateProject(id: string, payload: Partial<AdminProjectInput>) {
  return adminRequest<AdminProjectResponse>(`/admin/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
