/*
 * PURPOSE:
 * Public site service layer.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Aggregates public site configuration (from environment variables), active Home media,
 * and published featured projects (with derived heroImage) into a unified site data response.
 */

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
  const [homeMedia, projects, developers] = await Promise.all([
    siteRepository.findHomeMedia(),
    siteRepository.findFeaturedProjects(),
    siteRepository.findPublishedDevelopers(),
  ]);

  return {
    data: {
      ...siteConfiguration(),

      homeMedia: homeMedia.map((media) => ({
        id: media.id,
        context: media.context,
        slot: media.slot,
        type: media.type,
        category: media.category,
        title: media.title,
        url: media.url,
        thumbnailUrl: media.thumbnailUrl,
        altText: media.altText,
        sortOrder: media.sortOrder,
        isPrimary: media.isPrimary,
      })),

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

      developers: developers.map((developer) => ({
        id: developer.id,
        name: developer.name,
        slug: developer.slug,
        logoUrl: developer.logoUrl,
        bannerMedia: developer.media[0] ?? null,
      })),
    },
  };
}
