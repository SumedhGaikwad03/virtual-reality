import { adminRequest } from "./admin-client";
import type {
  AdminLeadCreateInput,
  AdminLeadDeleteResponse,
  AdminLeadQuery,
  AdminLeadResponse,
  AdminLeadsResponse,
  AdminLeadUpdateInput,
} from "../types/admin-lead";

export function getLeads(query?: AdminLeadQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.search?.trim()) params.set("search", query.search.trim());
  if (query?.status) params.set("status", query.status);
  if (query?.developerId) params.set("developerId", query.developerId);
  if (query?.projectId) params.set("projectId", query.projectId);
  if (query?.configurationId) params.set("configurationId", query.configurationId);

  const queryString = params.toString();
  return adminRequest<AdminLeadsResponse>(
    `/admin/leads${queryString ? `?${queryString}` : ""}`,
  );
}

export function getLead(id: string) {
  return adminRequest<AdminLeadResponse>(`/admin/leads/${id}`);
}

export function createLead(payload: AdminLeadCreateInput) {
  return adminRequest<AdminLeadResponse>("/admin/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateLead(id: string, payload: AdminLeadUpdateInput) {
  return adminRequest<AdminLeadResponse>(`/admin/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteLead(id: string) {
  return adminRequest<AdminLeadDeleteResponse>(`/admin/leads/${id}`, {
    method: "DELETE",
  });
}
