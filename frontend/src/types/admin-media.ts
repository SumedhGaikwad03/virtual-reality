/*
 * PURPOSE:
 * Admin media domain type definitions.
 *
 * FLOW:
 * Admin Media Management Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for Media DTOs, contexts (HOME, DEVELOPER, PROJECT, CONFIGURATION),
 * categories, media types (IMAGE, DOCUMENT, VIDEO), and upload/update inputs.
 */

export type MediaType =
  | "IMAGE"
  | "DOCUMENT"
  | "VIDEO";

export type MediaContext =
  | "HOME"
  | "DEVELOPER"
  | "PROJECT"
  | "CONFIGURATION";

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
  | "PROJECT_VIDEO"
  | "DEVELOPER_BANNER"
  | "DEVELOPER_HERO";

export type AdminMedia = {
  id: string;

  developerId: string | null;
  projectId: string | null;
  configurationId: string | null;

  context: MediaContext;
  slot: string | null;

  type: MediaType;
  category: MediaCategory;

  title: string | null;

  url: string;
  thumbnailUrl: string | null;
  altText: string | null;

  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;

  source: string;
  sourceUrl: string | null;

  createdAt: string;
  updatedAt: string;
};

export type MediaMetadataInput = {
  context?: MediaContext;
  slot?: string | null;

  category?: MediaCategory;
  title?: string | null;
  altText?: string | null;

  sortOrder?: number;
  isPrimary?: boolean;
  isActive?: boolean;
};

export type MediaUploadInput = {
  file: File;

  context: MediaContext;

  type: MediaType;
  category: MediaCategory;

  developerId?: string;
  projectId?: string;
  configurationId?: string;

  slot?: string;

  title?: string;
  altText?: string;

  sortOrder?: number;
  isPrimary?: boolean;
};

export type AdminMediaResponse = {
  data: AdminMedia;
};

export type AdminMediaListResponse = {
  data: AdminMedia[];
};
