/*
 * PURPOSE:
 * Admin HTTP client for Rental Desk domain management.
 *
 * FLOW:
 * Admin Rental Pages -> admin-rentals.ts -> adminRequest (/api/admin/rentals/*) -> Express Backend.
 *
 * RESPONSIBILITY:
 * Provides strongly typed CRUD operations for Rental Enquiries and Rental Properties
 * with automatic JWT authorization and query parameter serialization.
 */

import { adminRequest } from "./admin-client";
import type {
  AdminRentalEnquiriesResponse,
  AdminRentalEnquiryCreateInput,
  AdminRentalEnquiryDeleteResponse,
  AdminRentalEnquiryQuery,
  AdminRentalEnquiryResponse,
  AdminRentalEnquiryUpdateInput,
  AdminRentalPropertiesResponse,
  AdminRentalPropertyCreateInput,
  AdminRentalPropertyDeleteResponse,
  AdminRentalPropertyQuery,
  AdminRentalPropertyResponse,
  AdminRentalPropertyUpdateInput,
} from "../types/admin-rental";

export function createRentalEnquiry(payload: AdminRentalEnquiryCreateInput) {
  return adminRequest<AdminRentalEnquiryResponse>(
    "/admin/rentals/enquiries",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function getRentalEnquiries(query?: AdminRentalEnquiryQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.search?.trim()) params.set("search", query.search.trim());
  if (query?.status) params.set("status", query.status);

  const queryString = params.toString();
  return adminRequest<AdminRentalEnquiriesResponse>(
    `/admin/rentals/enquiries${queryString ? `?${queryString}` : ""}`,
  );
}

export function getRentalEnquiry(id: string) {
  return adminRequest<AdminRentalEnquiryResponse>(
    `/admin/rentals/enquiries/${id}`,
  );
}

export function getRelevantAvailableProperties(enquiryId: string) {
  return adminRequest<{ data: AdminRentalProperty[] }>(
    `/admin/rentals/enquiries/${enquiryId}/available-properties`,
  );
}

export function updateRentalEnquiry(
  id: string,
  payload: AdminRentalEnquiryUpdateInput,
) {
  return adminRequest<AdminRentalEnquiryResponse>(
    `/admin/rentals/enquiries/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteRentalEnquiry(id: string) {
  return adminRequest<AdminRentalEnquiryDeleteResponse>(
    `/admin/rentals/enquiries/${id}`,
    {
      method: "DELETE",
    },
  );
}

/*
 * -------------------------------------------------------------
 * RENTAL PROPERTIES (Supplies / Landlords)
 * -------------------------------------------------------------
 */

export function createRentalProperty(payload: AdminRentalPropertyCreateInput) {
  return adminRequest<AdminRentalPropertyResponse>(
    "/admin/rentals/properties",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function getRentalProperties(query?: AdminRentalPropertyQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.search?.trim()) params.set("search", query.search.trim());
  if (query?.status) params.set("status", query.status);

  const queryString = params.toString();
  return adminRequest<AdminRentalPropertiesResponse>(
    `/admin/rentals/properties${queryString ? `?${queryString}` : ""}`,
  );
}

export function getRentalProperty(id: string) {
  return adminRequest<AdminRentalPropertyResponse>(
    `/admin/rentals/properties/${id}`,
  );
}

export function updateRentalProperty(
  id: string,
  payload: AdminRentalPropertyUpdateInput,
) {
  return adminRequest<AdminRentalPropertyResponse>(
    `/admin/rentals/properties/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteRentalProperty(id: string) {
  return adminRequest<AdminRentalPropertyDeleteResponse>(
    `/admin/rentals/properties/${id}`,
    {
      method: "DELETE",
    },
  );
}

