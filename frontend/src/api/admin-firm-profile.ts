/*
 * PURPOSE:
 * Admin firm profile API client.
 *
 * FLOW:
 * Admin Firm Profile Page -> admin-firm-profile.ts -> Admin API (/api/admin/firm-profile).
 *
 * RESPONSIBILITY:
 * Provides typed functions to fetch and update persisted company overview and founder profile details.
 */

import { adminRequest } from "./admin-client";

export type AdminFirmFounderImage = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  title: string | null;
} | null;

export type AdminFirmProfile = {
  id: string;
  founderName: string;
  founderTitle: string;
  founderExperience: string;
  founderBio: string | null;
  founderImageMediaId: string | null;
  founderImageMedia?: AdminFirmFounderImage;
  companyDescription: string | null;
  updatedAt?: string;
};

export type UpdateAdminFirmProfileInput = {
  founderName?: string;
  founderTitle?: string;
  founderExperience?: string;
  founderBio?: string | null;
  founderImageMediaId?: string | null;
  companyDescription?: string | null;
};

export async function getAdminFirmProfile(): Promise<{ data: AdminFirmProfile }> {
  return adminRequest<{ data: AdminFirmProfile }>("/admin/firm-profile");
}

export async function updateAdminFirmProfile(
  input: UpdateAdminFirmProfileInput,
): Promise<{ data: AdminFirmProfile }> {
  return adminRequest<{ data: AdminFirmProfile }>("/admin/firm-profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}
