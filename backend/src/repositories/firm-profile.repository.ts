/*
 * PURPOSE:
 * Firm profile and founder identity data access repository.
 *
 * FLOW:
 * Admin / Public Site Flow -> FirmProfileRepository -> PostgreSQL (Prisma).
 *
 * RESPONSIBILITY:
 * Provides single source of truth for persisted company overview and founder profile details
 * (founderName, founderTitle, founderExperience, founderBio, founderImageMediaId, companyDescription),
 * seamlessly referencing existing Media records.
 */

import { prisma } from "../lib/prisma.js";

export const DEFAULT_FIRM_PROFILE = {
  founderName: "Dipankar Jagtap",
  founderTitle: "Founder of Virtual Reality",
  founderExperience: "20+ years of experience in the real estate industry",
  founderBio:
    "Dipankar Jagtap has shaped the real estate landscape across Pune, delivering distinguished residential and commercial landmarks with exceptional architectural integrity.",
  founderImageMediaId: null as string | null,
  founderImageMedia: null as {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    altText: string | null;
    title: string | null;
  } | null,
  companyDescription:
    "Virtual Reality is a real-estate discovery platform showcasing prime residential developments and architectural landmarks.",
};

export type UpdateFirmProfileInput = {
  founderName?: string;
  founderTitle?: string;
  founderExperience?: string;
  founderBio?: string | null;
  founderImageMediaId?: string | null;
  companyDescription?: string | null;
};

export class FirmProfileRepository {
  async findProfile() {
    const profile = await prisma.firmProfile.findUnique({
      where: { id: "default" },
      include: {
        founderImageMedia: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
            title: true,
          },
        },
      },
    });

    if (!profile) {
      return {
        id: "default",
        ...DEFAULT_FIRM_PROFILE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return profile;
  }

  async updateProfile(data: UpdateFirmProfileInput) {
    const updatePayload: Record<string, any> = {};

    if (data.founderName !== undefined) {
      updatePayload.founderName = data.founderName.trim();
    }
    if (data.founderTitle !== undefined) {
      updatePayload.founderTitle = data.founderTitle.trim();
    }
    if (data.founderExperience !== undefined) {
      updatePayload.founderExperience = data.founderExperience.trim();
    }
    if (data.founderBio !== undefined) {
      updatePayload.founderBio = data.founderBio ? data.founderBio.trim() : null;
    }
    if (data.companyDescription !== undefined) {
      updatePayload.companyDescription = data.companyDescription ? data.companyDescription.trim() : null;
    }
    if (data.founderImageMediaId !== undefined) {
      // Validate that media exists if an ID is supplied
      if (data.founderImageMediaId) {
        const mediaExists = await prisma.media.findUnique({
          where: { id: data.founderImageMediaId },
        });
        if (!mediaExists) {
          throw {
            code: "INVALID_FIRM_PROFILE_REQUEST",
            message: "Referenced founder image media record does not exist",
          };
        }
        updatePayload.founderImageMediaId = data.founderImageMediaId;
      } else {
        updatePayload.founderImageMediaId = null;
      }
    }

    return prisma.firmProfile.upsert({
      where: { id: "default" },
      update: updatePayload,
      create: {
        id: "default",
        founderName: data.founderName?.trim() || DEFAULT_FIRM_PROFILE.founderName,
        founderTitle: data.founderTitle?.trim() || DEFAULT_FIRM_PROFILE.founderTitle,
        founderExperience: data.founderExperience?.trim() || DEFAULT_FIRM_PROFILE.founderExperience,
        founderBio: data.founderBio ? data.founderBio.trim() : DEFAULT_FIRM_PROFILE.founderBio,
        founderImageMediaId: data.founderImageMediaId || null,
        companyDescription: data.companyDescription ? data.companyDescription.trim() : DEFAULT_FIRM_PROFILE.companyDescription,
      },
      include: {
        founderImageMedia: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
            title: true,
          },
        },
      },
    });
  }
}

export const firmProfileRepository = new FirmProfileRepository();
