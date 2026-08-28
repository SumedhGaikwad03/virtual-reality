/*
 * PURPOSE:
 * Public project domain type definitions.
 *
 * FLOW:
 * Public Project Discovery Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for Project aggregate, Developer summary, Location,
 * Configuration, Highlights, Amenities, and Media models.
 */

export type MediaType =
  | "IMAGE"
  | "DOCUMENT"
  | "VIDEO";

export type MediaCategory =
  | "HERO"
  | "HERO_CAROUSEL"
  | "CARD"
  | "GALLERY"
  | "AMENITY"
  | "EXTERIOR"
  | "INTERIOR"
  | "LOCATION"
  | "CONSTRUCTION"
  | "FLOOR_PLAN"
  | "BROCHURE"
  | "PROJECT_VIDEO";

export type Media = {
  id: string;
  type: MediaType;
  category: MediaCategory;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type Developer = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type Location = {
  name: string;
  slug: string;
  address: string;
  mapsUrl: string | null;
};

export type Configuration = {
  id: string;
  name: string;
  bhk: number;
  carpetArea: number;
  builtUpArea: number | null;
  superBuiltUpArea: number | null;
  priceFrom: string;
  availabilityStatus:
    | "AVAILABLE"
    | "LIMITED"
    | "SOLD_OUT";
  media: Media[];
};

export type ProjectHighlight = {
  id: string;
  text: string;
  sortOrder: number;
};

export type ProjectAmenity = {
  id: string;
  name: string;
  sortOrder: number;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  location: Location;

  status:
    | "UPCOMING"
    | "ONGOING"
    | "READY_TO_MOVE"
    | "COMPLETED"
    | "SOLD_OUT";

  featured: boolean;

  developer: Developer;

  highlights: ProjectHighlight[];

  amenities: ProjectAmenity[];

  configurations: Configuration[];

  media: Media[];
};