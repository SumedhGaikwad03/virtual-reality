/*
 * PURPOSE:
 * Public developer domain type definitions.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for Developer profile, developer ProjectCard, and PublicDeveloper aggregate.
 */

import type { Media } from "./project";

export type Developer = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
};

export type ProjectCard = {
  id: string;
  name: string;
  slug: string;
  location: {
    name: string;
    slug: string;
  };
  status:
    | "UPCOMING"
    | "ONGOING"
    | "READY_TO_MOVE"
    | "COMPLETED"
    | "SOLD_OUT";
  featured: boolean;
  media: Media | null;
};

export type PublicDeveloper = Developer & {
  media: Media[];
  projects: ProjectCard[];
};