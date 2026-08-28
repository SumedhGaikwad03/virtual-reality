/*
 * PURPOSE:
 * Admin project domain type definitions.
 *
 * FLOW:
 * Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for AdminProject entity, input payload, and API responses.
 */

import type { PublishStatus } from "./admin-developer";

export type ProjectStatus =
  | "UPCOMING"
  | "ONGOING"
  | "READY_TO_MOVE"
  | "COMPLETED"
  | "SOLD_OUT";

export type AdminProject = {
  id: string;
  developerId: string;
  developer: { id: string; name: string; slug: string };
  name: string;
  slug: string;
  description: string | null;
  locationName: string;
  locationSlug: string;
  address: string;
  mapsUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  publishStatus: PublishStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminProjectInput = {
  developerId: string;
  name: string;
  slug: string;
  description?: string;
  locationName: string;
  locationSlug: string;
  address: string;
  mapsUrl?: string;
  status: ProjectStatus;
  featured?: boolean;
  publishStatus?: PublishStatus;
};

export type AdminProjectResponse = { data: AdminProject };
export type AdminProjectsResponse = { data: AdminProject[] };
