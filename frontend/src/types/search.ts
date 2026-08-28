/*
 * PURPOSE:
 * Direct text search domain type definitions.
 *
 * FLOW:
 * Natural Language Search Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for search result items, matched projects, developers, configurations,
 * and API response wrappers.
 */

import type { AvailabilityStatus } from "./admin-configuration";
import type { ProjectStatus } from "./project";

export type SearchResult = {
  project: {
    id: string;
    name: string;
    slug: string;
    location: {
      name: string;
      slug: string;
    };
    status: ProjectStatus;
  };
  developer: {
    id: string;
    name: string;
    slug: string;
  };
  configuration: {
    id: string;
    name: string;
    bhk: number;
    carpetArea: number;
    priceFrom: string;
    availabilityStatus: AvailabilityStatus;
  };
};

export type SearchResponse = {
  data: SearchResult[];
};
