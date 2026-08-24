import { prisma } from "../lib/prisma.js";

export class SearchCatalogRepository {
  findCatalog() {
    return prisma.project.findMany({
      orderBy: [
        { featured: "desc" },
        { name: "asc" },
        { id: "asc" },
      ],
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