import { adminRequest } from "./admin-client";
import type { AdminRole } from "../auth/types";

export type AdminLocationItem = {
  id: string;
  name: string | null;
  email: string;
  role: AdminRole;
  latitude: number | null;
  longitude: number | null;
  lastLocationAt: string | null;
};

export type AdminLocationsResponse = {
  data: AdminLocationItem[];
};

export type AdminLocationUpdateInput = {
  latitude: number;
  longitude: number;
};

export type AdminLocationUpdateResponse = {
  data: {
    latitude: number;
    longitude: number;
    lastLocationAt: string;
  };
};

export function updateAdminLocation(input: AdminLocationUpdateInput) {
  return adminRequest<AdminLocationUpdateResponse>("/admin/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function getAdminLocations() {
  return adminRequest<AdminLocationsResponse>("/admin/locations");
}
