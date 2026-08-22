export type SiteContact = {
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type SiteHeroImage = {
  url: string;
  thumbnailUrl: string | null;
} | null;

export type FeaturedProject = {
  id: string;
  name: string;
  slug: string;
  location: {
    name: string;
    slug: string;
  };
  status: "UPCOMING" | "ONGOING" | "READY_TO_MOVE" | "COMPLETED" | "SOLD_OUT";
  developer: {
    id: string;
    name: string;
    slug: string;
  };
  heroImage: SiteHeroImage;
};

export type Site = {
  name: string | null;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  contact: SiteContact;
  featuredProjects: FeaturedProject[];
};
