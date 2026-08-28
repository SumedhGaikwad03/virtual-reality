/*
 * PURPOSE:
 * Admin configuration API client.
 *
 * FLOW:
 * Admin Configuration Management Flow
 *
 * RESPONSIBILITY:
 * Provides CRUD HTTP client functions (getConfigurations, getConfiguration, createConfiguration, updateConfiguration)
 * targeting the authenticated admin configuration endpoints.
 */

import { adminRequest } from "./admin-client";
import type {
  AdminConfigurationInput,
  AdminConfigurationResponse,
  AdminConfigurationsResponse,
} from "../types/admin-configuration";

export function getConfigurations(projectId: string) {
  return adminRequest<AdminConfigurationsResponse>(
    `/admin/projects/${projectId}/configurations`,
  );
}

export function getConfiguration(id: string) {
  return adminRequest<AdminConfigurationResponse>(`/admin/configurations/${id}`);
}

export function createConfiguration(
  projectId: string,
  payload: AdminConfigurationInput,
) {
  return adminRequest<AdminConfigurationResponse>(
    `/admin/projects/${projectId}/configurations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function updateConfiguration(
  id: string,
  payload: Partial<AdminConfigurationInput>,
) {
  return adminRequest<AdminConfigurationResponse>(`/admin/configurations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
