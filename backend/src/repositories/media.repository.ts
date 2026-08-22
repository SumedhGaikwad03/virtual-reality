import { prisma } from "../lib/prisma.js";
import type {
  MediaCategory,
  MediaType,
} from "../../generated/prisma/enums.js";

const mediaSelect = {
  id: true,
  projectId: true,
  configurationId: true,
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
    projectId?: string;
    configurationId?: string;
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
    return prisma.media.create({ data, select: mediaSelect });
  }

  findById(id: string) {
    return prisma.media.findUnique({ where: { id }, select: mediaSelect });
  }

  findByProjectId(projectId: string) {
    return prisma.media.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: mediaSelect,
    });
  }

  findByConfigurationId(configurationId: string) {
    return prisma.media.findMany({
      where: { configurationId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: mediaSelect,
    });
  }

  update(
    id: string,
    data: {
      category?: MediaCategory;
      title?: string | null;
      altText?: string | null;
      sortOrder?: number;
      isPrimary?: boolean;
      isActive?: boolean;
    },
  ) {
    return prisma.media.update({ where: { id }, data, select: mediaSelect });
  }
}

export const mediaRepository = new MediaRepository();
