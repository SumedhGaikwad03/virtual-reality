export type ProjectStatus =
  | "UPCOMING"
  | "ONGOING"
  | "READY_TO_MOVE"
  | "COMPLETED"
  | "SOLD_OUT";

export type AdminProject = {
  id: string;
  developerId: string;
  developer: { id: string; name: string; slug: string };
  name: string;
  slug: string;
  description: string | null;
  locationName: string;
  locationSlug: string;
  address: string;
  mapsUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProjectInput = {
  developerId: string;
  name: string;
  slug: string;
  description?: string;
  locationName: string;
  locationSlug: string;
  address: string;
  mapsUrl?: string;
  status: ProjectStatus;
  featured?: boolean;
};

export type AdminProjectResponse = { data: AdminProject };
export type AdminProjectsResponse = { data: AdminProject[] };
