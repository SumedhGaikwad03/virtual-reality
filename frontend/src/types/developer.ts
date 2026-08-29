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

export type DeveloperProjectCard = {
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
  developer: {
    id: string;
    name: string;
    slug: string;
  };
  heroImage: Media | null;
  media: Media | null;
};

export type PublicDeveloper = Developer & {
  bannerMedia: Media | null;
  heroMedia: Media | null;
  media: Media[];
  projects: DeveloperProjectCard[];
};