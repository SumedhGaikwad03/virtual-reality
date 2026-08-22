export type AdminDeveloper = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminDeveloperInput = {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
};

export type AdminDeveloperResponse = { data: AdminDeveloper };
export type AdminDevelopersResponse = { data: AdminDeveloper[] };
