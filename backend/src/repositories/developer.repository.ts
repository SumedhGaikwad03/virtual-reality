/*
 * PURPOSE:
 * Developer data access repository.
 *
 * FLOW:
 * Public Developer Discovery Flow & Admin Developer Management Flow
 *
 * RESPONSIBILITY:
 * Executes Prisma queries for creating, updating, listing, and fetching developers.
 * Enforces strict publication filtering on public queries (developer and projects must be PUBLISHED).
 */

import { prisma } from "../lib/prisma.js";
import type { PublishStatus } from "../../generated/prisma/enums.js";

export class DeveloperRepository {
  create(data: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    publishStatus?: PublishStatus;
  }) {
    return prisma.developer.create({ data });
  }

  findMany() {
    return prisma.developer.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
      // Bounded administrative developer limit: Returns up to 100 developers to prevent unbounded database reads
      take: 100,
    });
  }

  findById(id: string) {
    return prisma.developer.findUnique({
      where: { id },
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      logoUrl?: string | null;
      websiteUrl?: string | null;
      publishStatus?: PublishStatus;
    },
  ) {
    return prisma.developer.update({
      where: { id },
      data,
    });
  }

  findPublicDeveloper(developerSlug: string) {
    return prisma.developer.findFirst({
      where: {
        slug: developerSlug,
        publishStatus: "PUBLISHED",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,

        media: {
          where: {
            isActive: true,
            context: "DEVELOPER",
          },
          orderBy: [
            { sortOrder: "asc" },
            { createdAt: "asc" },
            { id: "asc" },
          ],
          // Bounded developer media limit: Caps active developer media items
          take: 50,
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

        projects: {
          where: {
            publishStatus: "PUBLISHED",
          },
          orderBy: [{ name: "asc" }, { id: "asc" }],
          // Bounded developer portfolio limit: Caps public projects per developer
          take: 50,
          select: {
            id: true,
            name: true,
            slug: true,
            locationName: true,
            locationSlug: true,
            status: true,
            featured: true,

            media: {
              where: {
                type: "IMAGE",
                isActive: true,
                context: "PROJECT",
                OR: [
                  { category: "CARD" },
                  { category: "HERO" },
                  { isPrimary: true },
                ],
              },
              orderBy: [
                { isPrimary: "desc" },
                { sortOrder: "asc" },
                { id: "asc" },
              ],
              take: 3,
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

export const developerRepository = new DeveloperRepository();
