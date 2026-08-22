import { siteRepository } from "../repositories/site.repository.js";

function siteConfiguration() {
  return {
    name: process.env.SITE_NAME ?? null,
    tagline: process.env.SITE_TAGLINE ?? null,
    description: process.env.SITE_DESCRIPTION ?? null,
    logoUrl: process.env.SITE_LOGO_URL ?? null,
    contact: {
      phone: process.env.SITE_PHONE ?? null,
      email: process.env.SITE_EMAIL ?? null,
      address: process.env.SITE_ADDRESS ?? null,
    },
  };
}

function selectHeroImage(
  media: Array<{
    category: string;
    url: string;
    thumbnailUrl: string | null;
    sortOrder: number;
    isPrimary: boolean;
    id: string;
  }>,
) {
  const hero = media.find((item) => item.category === "HERO");
  const primary = media.find((item) => item.isPrimary);
  const selected = hero ?? primary ?? media[0];

  return selected
    ? { url: selected.url, thumbnailUrl: selected.thumbnailUrl }
    : null;
}

export async function getSite() {
  const projects = await siteRepository.findFeaturedProjects();

  return {
    data: {
      ...siteConfiguration(),
      featuredProjects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        location: {
          name: project.locationName,
          slug: project.locationSlug,
        },
        status: project.status,
        developer: project.developer,
        heroImage: selectHeroImage(project.media),
      })),
    },
  };
}
