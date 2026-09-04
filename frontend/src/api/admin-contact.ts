/*
 * PURPOSE:
 * Admin firm contact API client.
 *
 * FLOW:
 * Admin Contact Page -> admin-contact.ts -> Admin API (/api/admin/contact).
 *
 * RESPONSIBILITY:
 * Provides typed functions to fetch and update persisted firm contact settings.
 */

import { adminRequest } from "./admin-client";

export type AdminFirmContact = {
  id: string;
  contactPersonName: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl: string | null;
  whatsappUrl: string;
  updatedAt?: string;
};

export type UpdateAdminFirmContactInput = {
  contactPersonName?: string;
  phone?: string;
  email?: string;
  address?: string;
  googleMapsUrl?: string | null;
  whatsappUrl?: string;
};

export async function getAdminContact(): Promise<{ data: AdminFirmContact }> {
  return adminRequest<{ data: AdminFirmContact }>("/admin/contact");
}

export async function updateAdminContact(
  input: UpdateAdminFirmContactInput,
): Promise<{ data: AdminFirmContact }> {
  return adminRequest<{ data: AdminFirmContact }>("/admin/contact", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}
