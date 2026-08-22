export type ImportMediaPreview = {
  url: string;
  type: "IMAGE" | "DOCUMENT" | "VIDEO";
  category: "GALLERY" | "BROCHURE" | "PROJECT_VIDEO";
};

export type ImportConfigurationPreview = {
  name: string | null;
  bhk: number | null;
  carpetArea: number | null;
  builtUpArea: number | null;
  superBuiltUpArea: number | null;
  priceFromRaw: string | null;
  priceFrom: string | null;
  availabilityStatus: "AVAILABLE" | "LIMITED" | "SOLD_OUT" | null;
};

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
    status: "UPCOMING" | "ONGOING" | "READY_TO_MOVE" | "COMPLETED" | "SOLD_OUT" | null;
    featured: boolean | null;
  };
  configurations: ImportConfigurationPreview[];
  media: ImportMediaPreview[];
};
