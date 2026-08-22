import { prisma } from "../lib/prisma.js";

export class DeveloperRepository {
  create(data: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
  }) {
    return prisma.developer.create({ data });
  }

  findMany() {
    return prisma.developer.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  }

  findById(id: string) {
    return prisma.developer.findUnique({ where: { id } });
  }

  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      logoUrl?: string | null;
      websiteUrl?: string | null;
    },
  ) {
    return prisma.developer.update({ where: { id }, data });
  }

  findPublicDeveloper(developerSlug: string) {
    return prisma.developer.findUnique({
      where: {
        slug: developerSlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,
        projects: {
          orderBy: [{ name: "asc" }, { id: "asc" }],
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
                OR: [{ category: "HERO" }, { isPrimary: true }],
              },
              orderBy: [
                { isPrimary: "desc" },
                { sortOrder: "asc" },
                { id: "asc" },
              ],
              take: 1,
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
