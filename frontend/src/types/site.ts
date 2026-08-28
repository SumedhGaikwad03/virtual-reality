/*
 * PURPOSE:
 * Public site domain type definitions.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for public site configuration, Home media, featured projects, and site contact info.
 */

export type SiteContact = {
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type SiteHeroImage = {
  url: string;
  thumbnailUrl: string | null;
} | null;

export type HomeMedia = {
  id: string;
  context: "HOME";
  slot: string | null;
  type: "IMAGE" | "DOCUMENT" | "VIDEO";
  category:
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
  title: string | null;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type FeaturedProject = {
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
  developer: {
    id: string;
    name: string;
    slug: string;
  };
  heroImage: SiteHeroImage;
};

export type SiteDeveloper = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type Site = {
  name: string | null;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  contact: SiteContact;
  homeMedia: HomeMedia[];
  featuredProjects: FeaturedProject[];
  developers?: SiteDeveloper[];
};