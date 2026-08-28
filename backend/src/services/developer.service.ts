/*
 * PURPOSE:
 * Developer domain service layer.
 *
 * FLOW:
 * Public Developer Discovery Flow & Admin Developer Management Flow
 *
 * RESPONSIBILITY:
 * Encapsulates developer business logic: admin CRUD orchestration, unique constraint error mapping (409 Conflict),
 * public developer metadata formatting, and project card media resolution.
 */

import { developerRepository } from "../repositories/developer.repository.js";
import type { PublishStatus } from "../../generated/prisma/enums.js";

type DeveloperRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  publishStatus: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDeveloperInput = {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  publishStatus?: PublishStatus;
};

export type UpdateDeveloperInput = Partial<CreateDeveloperInput>;

export class AdminDeveloperError extends Error {
  constructor(
    public readonly code: "DEVELOPER_NOT_FOUND" | "DEVELOPER_SLUG_EXISTS",
    public readonly statusCode: 404 | 409,
    message: string,
  ) {
    super(message);
    this.name = "AdminDeveloperError";
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function toAdminDeveloper(developer: DeveloperRecord) {
  return {
    id: developer.id,
    name: developer.name,
    slug: developer.slug,
    description: developer.description,
    logoUrl: developer.logoUrl,
    websiteUrl: developer.websiteUrl,
    publishStatus: developer.publishStatus,
    createdAt: developer.createdAt,
    updatedAt: developer.updatedAt,
  };
}

export async function createDeveloper(input: CreateDeveloperInput) {
  try {
    const developer = await developerRepository.create(input);
    return { data: toAdminDeveloper(developer) };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AdminDeveloperError(
        "DEVELOPER_SLUG_EXISTS",
        409,
        "Developer slug already exists",
      );
    }
    throw error;
  }
}

export async function listDevelopers() {
  const developers = await developerRepository.findMany();
  return { data: developers.map(toAdminDeveloper) };
}

export async function getDeveloperById(id: string) {
  const developer = await developerRepository.findById(id);

  if (!developer) {
    throw new AdminDeveloperError(
      "DEVELOPER_NOT_FOUND",
      404,
      "Developer not found",
    );
  }

  return { data: toAdminDeveloper(developer) };
}

export async function updateDeveloper(
  id: string,
  input: UpdateDeveloperInput,
) {
  const existing = await developerRepository.findById(id);

  if (!existing) {
    throw new AdminDeveloperError(
      "DEVELOPER_NOT_FOUND",
      404,
      "Developer not found",
    );
  }

  try {
    const developer = await developerRepository.update(id, input);
    return { data: toAdminDeveloper(developer) };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AdminDeveloperError(
        "DEVELOPER_SLUG_EXISTS",
        409,
        "Developer slug already exists",
      );
    }
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                              PUBLIC DEVELOPER API                           */
/* -------------------------------------------------------------------------- */

function toPublicMedia(media: {
  id: string;
  type: string;
  category: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}) {
  return {
    id: media.id,
    type: media.type,
    category: media.category,
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    altText: media.altText,
    sortOrder: media.sortOrder,
    isPrimary: media.isPrimary,
  };
}

function selectProjectCardMedia(
  media: Array<{
    id: string;
    type: string;
    category: string;
    url: string;
    thumbnailUrl: string | null;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }>,
) {
  return (
    media.find((item) => item.category === "CARD") ??
    media.find((item) => item.category === "HERO") ??
    media.find((item) => item.isPrimary) ??
    media[0] ??
    null
  );
}

export class DeveloperNotFoundError extends Error {
  code = "DEVELOPER_NOT_FOUND";
  statusCode = 404;

  constructor() {
    super("Developer not found");
    this.name = "DeveloperNotFoundError";
  }
}

export async function getPublicDeveloper(developerSlug: string) {
  const developer = await developerRepository.findPublicDeveloper(developerSlug);

  if (!developer) {
    throw new DeveloperNotFoundError();
  }

  return {
    data: {
      id: developer.id,
      name: developer.name,
      slug: developer.slug,
      description: developer.description,
      logoUrl: developer.logoUrl,
      websiteUrl: developer.websiteUrl,

      media: developer.media.map(toPublicMedia),

      projects: developer.projects.map((project) => {
        const cardMedia = selectProjectCardMedia(project.media);

        return {
          id: project.id,
          name: project.name,
          slug: project.slug,
          location: {
            name: project.locationName,
            slug: project.locationSlug,
          },
          status: project.status,
          featured: project.featured,
          media: cardMedia ? toPublicMedia(cardMedia) : null,
        };
      }),
    },
  };
}