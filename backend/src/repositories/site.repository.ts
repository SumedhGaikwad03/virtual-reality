/*
 * PURPOSE:
 * Public site data access repository.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Executes Prisma queries to fetch active HOME-context media, published featured projects,
 * and published developers.
 */

import { prisma } from "../lib/prisma.js";

export class SiteRepository {
  findHomeMedia() {
    return prisma.media.findMany({
      where: {
        context: "HOME",
        isActive: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
      // Bounded homepage media limit: Caps active site-level media assets across hero, card, and gallery categories
      take: 50,
      select: {
        id: true,
        context: true,
        slot: true,
        type: true,
        category: true,
        title: true,
        url: true,
        thumbnailUrl: true,
        altText: true,
        sortOrder: true,
        isPrimary: true,
      },
    });
  }

  findFeaturedProjects() {
    return prisma.project.findMany({
      where: {
        featured: true,
        publishStatus: "PUBLISHED",
        developer: {
          publishStatus: "PUBLISHED",
        },
      },
      orderBy: [
        { name: "asc" },
        { id: "asc" },
      ],
      // Bounded showcase limit: Limits featured homepage projects to the top 20 items
      take: 20,
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
        media: {
          where: {
            type: "IMAGE",
            isActive: true,
            context: "PROJECT",
          },
          orderBy: [
            { sortOrder: "asc" },
            { createdAt: "asc" },
            { id: "asc" },
          ],
          select: {
            category: true,
            url: true,
            thumbnailUrl: true,
            sortOrder: true,
            isPrimary: true,
            id: true,
          },
        },
      },
    });
  }

  findPublishedDevelopers() {
    return prisma.developer.findMany({
      where: {
        publishStatus: "PUBLISHED",
      },
      orderBy: [
        { name: "asc" },
        { id: "asc" },
      ],
      // Bounded developer discovery limit: Returns top 50 published developers for homepage discovery
      take: 50,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        media: {
          where: {
            context: "DEVELOPER",
            category: "DEVELOPER_BANNER",
            isActive: true,
          },
          orderBy: [
            { isPrimary: "desc" },
            { sortOrder: "asc" },
            { createdAt: "asc" },
            { id: "asc" },
          ],
          take: 1,
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
      },
    });
  }
}

export const siteRepository = new SiteRepository();
