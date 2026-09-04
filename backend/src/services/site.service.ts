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
import { contactRepository } from "../repositories/contact.repository.js";
import { firmProfileRepository } from "../repositories/firm-profile.repository.js";

function siteConfiguration() {
  return {
    name: process.env.SITE_NAME ?? null,
    tagline: process.env.SITE_TAGLINE ?? null,
    description: process.env.SITE_DESCRIPTION ?? null,
    logoUrl: process.env.SITE_LOGO_URL ?? null,
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
  const [homeMedia, projects, developers, contact, profile] = await Promise.all([
    siteRepository.findHomeMedia(),
    siteRepository.findFeaturedProjects(),
    siteRepository.findPublishedDevelopers(),
    contactRepository.findContact(),
    firmProfileRepository.findProfile(),
  ]);

  return {
    data: {
      ...siteConfiguration(),

      contact: {
        contactPersonName: contact.contactPersonName,
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        googleMapsUrl: contact.googleMapsUrl,
        whatsappUrl: contact.whatsappUrl,
      },

      firmProfile: {
        founderName: profile.founderName,
        founderTitle: profile.founderTitle,
        founderExperience: profile.founderExperience,
        founderBio: profile.founderBio,
        companyDescription: profile.companyDescription,
        founderImageMediaId: profile.founderImageMediaId,
        founderImage: profile.founderImageMedia
          ? {
              id: profile.founderImageMedia.id,
              url: profile.founderImageMedia.url,
              thumbnailUrl: profile.founderImageMedia.thumbnailUrl,
              altText: profile.founderImageMedia.altText,
              title: profile.founderImageMedia.title,
            }
          : null,
      },

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
