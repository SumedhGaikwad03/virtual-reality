/*
 * PURPOSE:
 * Property search data access repository.
 *
 * FLOW:
 * Property Search Persistence Flow
 *
 * RESPONSIBILITY:
 * Executes dynamic Prisma queries against published configuration records matching query filters,
 * strictly enforcing the publication boundary (Project AND Developer must be PUBLISHED).
 */

import { prisma } from "../lib/prisma.js";
import type { PropertySearchQuery } from "../services/search/query-generator.service.js";

export class SearchRepository {
  findProperties(query: PropertySearchQuery) {
    if (Object.keys(query).length === 0) return Promise.resolve([]);

    return prisma.configuration.findMany({
      where: {
        // Exact bedroom count matching
        ...(query.bhk === undefined ? {} : { bhk: query.bhk }),

        // Carpet area boundary filter
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

        // Maximum budget boundary in paise
        ...(query.maxPrice === undefined
          ? {}
          : { priceFrom: { lte: query.maxPrice } }),

        // Availability status filter
        ...(query.availabilityStatus === undefined
          ? {}
          : { availabilityStatus: query.availabilityStatus }),

        // Strict publication boundary: only published projects belonging to published developers are discoverable
        project: {
          publishStatus: "PUBLISHED",
          developer: {
            publishStatus: "PUBLISHED",
            ...(query.developerSlug === undefined
              ? {}
              : { slug: query.developerSlug }),
          },
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
      // Deterministic search result ordering
      orderBy: [
        { project: { featured: "desc" } },
        { project: { name: "asc" } },
        { bhk: "asc" },
        { name: "asc" },
        { id: "asc" },
      ],
      // Bounded query limit: Caps search results to top 50 matches to prevent large payload memory spikes
      take: 50,
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
