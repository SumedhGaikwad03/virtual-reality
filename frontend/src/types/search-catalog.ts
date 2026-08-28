/*
 * PURPOSE:
 * Search catalog domain type definitions.
 *
 * FLOW:
 * Guided Search Data Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for published projects, configurations, and API response payloads
 * used by the guided conversational search catalog.
 */

import type { AvailabilityStatus } from "./admin-configuration";
import type { ProjectStatus } from "./project";

export type SearchCatalogConfiguration = {
  id: string;
  bhk: number;
  carpetArea: number;
  priceFrom: string;
  availabilityStatus: AvailabilityStatus;
};

export type SearchCatalogProject = {
  id: string;
  name: string;
  slug: string;

  developer: {
    id: string;
    name: string;
    slug: string;
  };

  location: {
    name: string;
    slug: string;
  };

  status: ProjectStatus;
  configurations: SearchCatalogConfiguration[];
};

export type SearchCatalogResponse = {
  data: SearchCatalogProject[];
};