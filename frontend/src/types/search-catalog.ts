import type { AvailabilityStatus } from "./admin-configuration";

export type SearchCatalogConfiguration = {
  id: string;
  bhk: number;
  carpetArea: number;
  priceFrom: string;
  availabilityStatus: AvailabilityStatus;
};

export type SearchCatalogProject = {
  id: string;
  name: string;
  slug: string;

  developer: {
    id: string;
    name: string;
    slug: string;
  };

  location: {
    name: string;
    slug: string;
  };

  status: string;

  configurations: SearchCatalogConfiguration[];
};

export type SearchCatalogResponse = {
  data: SearchCatalogProject[];
};