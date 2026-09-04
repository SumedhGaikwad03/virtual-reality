/*
 * PURPOSE:
 * Media data access repository.
 *
 * FLOW:
 * Media Persistence Flow
 *
 * RESPONSIBILITY:
 * Executes Prisma queries for Media persistence:
 * - Creates Media records with manual source and initial metadata.
 * - Retrieves Media by developer, project, configuration, context, and ID with deterministic sort ordering.
 * - Updates Media metadata and activation status.
 */

import { prisma } from "../lib/prisma.js";

import type {
  MediaCategory,
  MediaContext,
  MediaType,
} from "../../generated/prisma/enums.js";

const mediaSelect = {
  id: true,
  developerId: true,
  projectId: true,
  configurationId: true,
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
  isActive: true,
  source: true,
  sourceUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class MediaRepository {
  create(data: {
    developerId?: string;
    projectId?: string;
    configurationId?: string;

    context: MediaContext;
    slot?: string;

    type: MediaType;
    category: MediaCategory;

    title?: string;
    url: string;
    thumbnailUrl?: string;
    altText?: string;

    sortOrder?: number;
    isPrimary?: boolean;

    source: "MANUAL";
    sourceUrl?: string;
  }) {
    return prisma.media.create({
      data,
      select: mediaSelect,
    });
  }

  findById(id: string) {
    return prisma.media.findUnique({
      where: { id },
      select: mediaSelect,
    });
  }

  // Deterministic ordering: lowest sortOrder first, then createdAt asc, then unique ID asc
  findByDeveloperId(developerId: string) {
    return prisma.media.findMany({
      where: {
        developerId,
        context: "DEVELOPER",
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
      // Bounded developer media limit: Caps gallery media per developer
      take: 100,
      select: mediaSelect,
    });
  }

  findByProjectId(projectId: string) {
    return prisma.media.findMany({
      where: {
        projectId,
        context: "PROJECT",
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
      // Bounded project media limit: Caps gallery media per project
      take: 100,
      select: mediaSelect,
    });
  }

  findByConfigurationId(configurationId: string) {
    return prisma.media.findMany({
      where: {
        configurationId,
        context: "CONFIGURATION",
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
      // Bounded configuration media limit: Caps media items per configuration
      take: 100,
      select: mediaSelect,
    });
  }

  findByContext(
    context: MediaContext,
    slot?: string,
  ) {
    return prisma.media.findMany({
      where: {
        context,
        ...(slot ? { slot } : {}),
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
      // Bounded context media limit: Caps media items matching context and slot
      take: 100,
      select: mediaSelect,
    });
  }

  update(
    id: string,
    data: {
      context?: MediaContext;
      slot?: string | null;

      category?: MediaCategory;
      title?: string | null;
      altText?: string | null;

      sortOrder?: number;
      isPrimary?: boolean;
      isActive?: boolean;
    },
  ) {
    return prisma.media.update({
      where: { id },
      data,
      select: mediaSelect,
    });
  }

  delete(id: string) {
    return prisma.media.delete({
      where: { id },
      select: mediaSelect,
    });
  }
}

export const mediaRepository = new MediaRepository();
