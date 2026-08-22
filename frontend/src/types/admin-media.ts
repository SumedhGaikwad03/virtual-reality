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

export type AdminMedia = {
  id: string;
  projectId: string | null;
  configurationId: string | null;
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
  category?: MediaCategory;
  title?: string | null;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
  isActive?: boolean;
};

export type MediaUploadInput = {
  file: File;
  type: MediaType;
  category: MediaCategory;
  title?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  projectId?: string;
  configurationId?: string;
};

export type AdminMediaResponse = { data: AdminMedia };
export type AdminMediaListResponse = { data: AdminMedia[] };
