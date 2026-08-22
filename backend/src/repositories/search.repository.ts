import { prisma } from "../lib/prisma.js";
import type { PropertySearchQuery } from "../services/search/query-generator.service.js";

export class SearchRepository {
  findProperties(query: PropertySearchQuery) {
    if (Object.keys(query).length === 0) return Promise.resolve([]);

    return prisma.configuration.findMany({
      where: {
        ...(query.bhk === undefined ? {} : { bhk: query.bhk }),
        ...(query.minCarpetArea === undefined && query.maxCarpetArea === undefined
          ? {}
          : {
              carpetArea: {
                ...(query.minCarpetArea === undefined
                  ? {}
                  : { gte: query.minCarpetArea }),
                ...(query.maxCarpetArea === undefined
                  ? {}
                  : { lte: query.maxCarpetArea }),
              },
            }),
        ...(query.maxPrice === undefined
          ? {}
          : { priceFrom: { lte: query.maxPrice } }),
        ...(query.availabilityStatus === undefined
          ? {}
          : { availabilityStatus: query.availabilityStatus }),
        project: {
          ...(query.developerSlug === undefined
            ? {}
            : { developer: { slug: query.developerSlug } }),
          ...(query.locationSlug === undefined
            ? {}
            : { locationSlug: query.locationSlug }),
          ...(query.projectSlug === undefined
            ? {}
            : { slug: query.projectSlug }),
          ...(query.projectStatus === undefined
            ? {}
            : { status: query.projectStatus }),
        },
      },
      orderBy: [
        { project: { featured: "desc" } },
        { project: { name: "asc" } },
        { bhk: "asc" },
        { name: "asc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        name: true,
        bhk: true,
        carpetArea: true,
        priceFrom: true,
        availabilityStatus: true,
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            locationName: true,
            locationSlug: true,
            status: true,
            featured: true,
            developer: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });
  }
}

export const searchRepository = new SearchRepository();
