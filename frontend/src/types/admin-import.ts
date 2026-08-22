import type { AvailabilityStatus } from "./admin-configuration";
import type { ProjectStatus } from "./admin-project";

export type ImportDraft = {
  sourceUrl: string;
  developer: {
    name: string | null;
    slug: string | null;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
  };
  project: {
    name: string | null;
    slug: string | null;
    description: string | null;
    locationName: string | null;
    locationSlug: string | null;
    address: string | null;
    mapsUrl: string | null;
    status: ProjectStatus | null;
    featured: boolean | null;
  };
  configurations: Array<{
    name: string | null;
    bhk: number | null;
    carpetArea: number | null;
    builtUpArea: number | null;
    superBuiltUpArea: number | null;
    priceFromRaw: string | null;
    priceFrom: string | null;
    availabilityStatus: AvailabilityStatus | null;
  }>;
  media: Array<{
    url: string;
    type: "IMAGE" | "DOCUMENT" | "VIDEO";
    category: "GALLERY" | "BROCHURE" | "PROJECT_VIDEO";
  }>;
};

export type ImportAnalyzeResponse = { data: ImportDraft };
