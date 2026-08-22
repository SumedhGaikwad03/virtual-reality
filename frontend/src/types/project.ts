export type MediaType = "IMAGE" | "DOCUMENT" | "VIDEO";

export type MediaCategory =
  | "HERO"
  | "HERO_CAROUSEL"
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
  availabilityStatus: "AVAILABLE" | "LIMITED" | "SOLD_OUT";
  media: Media[];
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: Location;
  status: "UPCOMING" | "ONGOING" | "READY_TO_MOVE" | "COMPLETED" | "SOLD_OUT";
  featured: boolean;
  developer: Developer;
  configurations: Configuration[];
  media: Media[];
};
