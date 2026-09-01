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

export function getProjectAmenities(projectId: string) {
  return adminRequest<{ data: import("../types/admin-project").ProjectAmenity[] }>(
    `/admin/projects/${projectId}/amenities`,
  );
}

export function createProjectAmenity(
  projectId: string,
  payload: { name: string; sortOrder?: number },
) {
  return adminRequest<{ data: import("../types/admin-project").ProjectAmenity }>(
    `/admin/projects/${projectId}/amenities`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function updateProjectAmenity(
  projectId: string,
  amenityId: string,
  payload: { name?: string; sortOrder?: number },
) {
  return adminRequest<{ data: import("../types/admin-project").ProjectAmenity }>(
    `/admin/projects/${projectId}/amenities/${amenityId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteProjectAmenity(projectId: string, amenityId: string) {
  return adminRequest<{ success: boolean }>(
    `/admin/projects/${projectId}/amenities/${amenityId}`,
    {
      method: "DELETE",
    },
  );
}

export function createProjectHighlight(
  projectId: string,
  payload: { text: string; sortOrder?: number },
) {
  return adminRequest<{ data: import("../types/admin-project").ProjectHighlight }>(
    `/admin/projects/${projectId}/highlights`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function updateProjectHighlight(
  projectId: string,
  highlightId: string,
  payload: { text?: string; sortOrder?: number },
) {
  return adminRequest<{ data: import("../types/admin-project").ProjectHighlight }>(
    `/admin/projects/${projectId}/highlights/${highlightId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteProjectHighlight(projectId: string, highlightId: string) {
  return adminRequest<{ success: boolean }>(
    `/admin/projects/${projectId}/highlights/${highlightId}`,
    { method: "DELETE" },
  );
}
