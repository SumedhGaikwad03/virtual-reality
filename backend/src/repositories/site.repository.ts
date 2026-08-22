import { prisma } from "../lib/prisma.js";

export class SiteRepository {
  findFeaturedProjects() {
    return prisma.project.findMany({
      where: { featured: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
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
          where: { type: "IMAGE" },
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
}

export const siteRepository = new SiteRepository();
