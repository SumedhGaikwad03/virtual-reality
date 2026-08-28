/*
 * PURPOSE:
 * Project data access repository.
 *
 * FLOW:
 * Public Project Discovery Flow & Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Executes Prisma database queries for Project persistence. Enforces multi-relation publication rules
 * (Project.publishStatus === PUBLISHED && Developer.publishStatus === PUBLISHED) and orders highlights,
 * amenities, configurations, and media.
 */

import { prisma } from "../lib/prisma.js";
import type {
  ProjectStatus,
  PublishStatus,
} from "../../generated/prisma/enums.js";

export class ProjectRepository {
  create(data: {
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
    publishStatus?: PublishStatus;
  }) {
    return prisma.project.create({
      data,
      select: adminProjectSelect,
    });
  }

  findMany() {
    return prisma.project.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
      // Bounded administrative project limit: Returns up to 100 projects to protect memory and response payload size
      take: 100,
      select: adminProjectSelect,
    });
  }

  findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      select: adminProjectSelect,
    });
  }

  update(
    id: string,
    data: {
      developerId?: string;
      name?: string;
      slug?: string;
      description?: string | null;
      locationName?: string;
      locationSlug?: string;
      address?: string;
      mapsUrl?: string | null;
      status?: ProjectStatus;
      featured?: boolean;
      publishStatus?: PublishStatus;
    },
  ) {
    return prisma.project.update({
      where: { id },
      data,
      select: adminProjectSelect,
    });
  }

  findPublicProject(
    developerSlug: string,
    locationSlug: string,
    projectSlug: string,
  ) {
    return prisma.project.findFirst({
      where: {
        slug: projectSlug,
        locationSlug,
        publishStatus: "PUBLISHED",
        developer: {
          slug: developerSlug,
          publishStatus: "PUBLISHED",
        },
      },

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        locationName: true,
        locationSlug: true,
        address: true,
        mapsUrl: true,
        status: true,
        featured: true,
        publishStatus: true,

        developer: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },

        highlights: {
          orderBy: [
            { sortOrder: "asc" },
            { id: "asc" },
          ],
          select: {
            id: true,
            text: true,
            sortOrder: true,
          },
        },

        amenities: {
          orderBy: [
            { sortOrder: "asc" },
            { id: "asc" },
          ],
          select: {
            id: true,
            name: true,
            sortOrder: true,
          },
        },

        media: {
          where: {
            isActive: true,
          },
          orderBy: [
            { sortOrder: "asc" },
            { createdAt: "asc" },
            { id: "asc" },
          ],
          select: {
            id: true,
            type: true,
            category: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
            sortOrder: true,
            isPrimary: true,
          },
        },

        configurations: {
          orderBy: [
            { name: "asc" },
            { id: "asc" },
          ],
          select: {
            id: true,
            name: true,
            bhk: true,
            carpetArea: true,
            builtUpArea: true,
            superBuiltUpArea: true,
            priceFrom: true,
            availabilityStatus: true,

            media: {
              where: {
                isActive: true,
              },
              orderBy: [
                { sortOrder: "asc" },
                { createdAt: "asc" },
                { id: "asc" },
              ],
              select: {
                id: true,
                type: true,
                category: true,
                url: true,
                thumbnailUrl: true,
                altText: true,
                sortOrder: true,
                isPrimary: true,
              },
            },
          },
        },
      },
    });
  }
}

const adminProjectSelect = {
  id: true,
  developerId: true,

  developer: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },

  name: true,
  slug: true,
  description: true,
  locationName: true,
  locationSlug: true,
  address: true,
  mapsUrl: true,
  status: true,
  featured: true,
  publishStatus: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const projectRepository = new ProjectRepository();