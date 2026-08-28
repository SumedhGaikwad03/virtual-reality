/*
 * PURPOSE:
 * Search catalog data access repository.
 *
 * FLOW:
 * Search Catalog Persistence Flow
 *
 * RESPONSIBILITY:
 * Retrieves published projects and configurations for client-side search catalog construction,
 * strictly enforcing the publication boundary (Project AND Developer must be PUBLISHED).
 */

import { prisma } from "../lib/prisma.js";

export class SearchCatalogRepository {
  findCatalog() {
    return prisma.project.findMany({
      where: {
        // Enforces publication safety for both Project and Developer
        publishStatus: "PUBLISHED",
        developer: {
          publishStatus: "PUBLISHED",
        },
      },
      orderBy: [
        { featured: "desc" },
        { name: "asc" },
        { id: "asc" },
      ],
      // Bounded catalog limit: Safely caps published project inventory for in-memory guided search
      take: 200,
      select: {
        id: true,
        name: true,
        slug: true,
        locationName: true,
        locationSlug: true,
        status: true,

        developer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        configurations: {
          orderBy: [
            { bhk: "asc" },
            { priceFrom: "asc" },
            { id: "asc" },
          ],
          select: {
            id: true,
            bhk: true,
            carpetArea: true,
            priceFrom: true,
            availabilityStatus: true,
          },
        },
      },
    });
  }
}

export const searchCatalogRepository =
  new SearchCatalogRepository();