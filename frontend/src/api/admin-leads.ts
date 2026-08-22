import { adminRequest } from "./admin-client";
import type {
  AdminLeadResponse,
  AdminLeadsResponse,
  AdminLeadUpdateInput,
} from "../types/admin-lead";

export function getLeads() {
  return adminRequest<AdminLeadsResponse>("/admin/leads");
}

export function getLead(id: string) {
  return adminRequest<AdminLeadResponse>(`/admin/leads/${id}`);
}

export function updateLead(id: string, payload: AdminLeadUpdateInput) {
  return adminRequest<AdminLeadResponse>(`/admin/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
