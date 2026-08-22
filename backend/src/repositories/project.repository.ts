import { prisma } from "../lib/prisma.js";
import type { ProjectStatus } from "../../generated/prisma/enums.js";

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
  }) {
    return prisma.project.create({
      data,
      select: adminProjectSelect,
    });
  }

  findMany() {
    return prisma.project.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
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
        developer: {
          slug: developerSlug,
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
        developer: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        media: {
          orderBy: {
            sortOrder: "asc",
          },
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
          orderBy: {
            name: "asc",
          },
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
              orderBy: {
                sortOrder: "asc",
              },
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
  createdAt: true,
  updatedAt: true,
} as const;

export const projectRepository = new ProjectRepository();
