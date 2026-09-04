/*
 * PURPOSE:
 * Project application service layer.
 *
 * FLOW:
 * Public Project Discovery Flow & Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Encapsulates project domain rules, ensures developer existence, handles slug uniqueness errors (P2002),
 * serializes BigInt values (priceFrom in paise) to strings, and transforms public/admin DTO responses.
 */

import { projectRepository } from "../repositories/project.repository.js";
import { developerRepository } from "../repositories/developer.repository.js";
import type {
  ProjectStatus,
  PublishStatus,
} from "../../generated/prisma/enums.js";

export type CreateProjectInput = {
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
  publishStatus?: PublishStatus;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export class AdminProjectError extends Error {
  constructor(
    public readonly code:
      | "PROJECT_NOT_FOUND"
      | "DEVELOPER_NOT_FOUND"
      | "PROJECT_SLUG_EXISTS"
      | "AMENITY_NOT_FOUND"
      | "INVALID_AMENITY_REQUEST"
      | "HIGHLIGHT_NOT_FOUND"
      | "INVALID_HIGHLIGHT_REQUEST",
    public readonly statusCode: 400 | 404 | 409,
    message: string,
  ) {
    super(message);
    this.name = "AdminProjectError";
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

function toAdminProject(project: {
  id: string;
  developerId: string;
  developer: {
    id: string;
    name: string;
    slug: string;
  };
  name: string;
  slug: string;
  description: string | null;
  locationName: string;
  locationSlug: string;
  address: string;
  mapsUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  publishStatus: PublishStatus;
  amenities?: {
    id: string;
    name: string;
    sortOrder: number;
  }[];
  highlights?: {
    id: string;
    text: string;
    sortOrder: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: project.id,
    developerId: project.developerId,
    developer: project.developer,
    name: project.name,
    slug: project.slug,
    description: project.description,
    locationName: project.locationName,
    locationSlug: project.locationSlug,
    address: project.address,
    mapsUrl: project.mapsUrl,
    status: project.status,
    featured: project.featured,
    publishStatus: project.publishStatus,
    amenities: project.amenities ?? [],
    highlights: project.highlights ?? [],
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

async function ensureDeveloperExists(developerId: string) {
  if (!(await developerRepository.findById(developerId))) {
    throw new AdminProjectError(
      "DEVELOPER_NOT_FOUND",
      404,
      "Developer not found",
    );
  }
}

/*
 * Project Slug Uniqueness Domain Invariant:
 * Project slug uniqueness is strictly scoped to the parent Developer (@@unique([developerId, slug])).
 * Two independent developers (e.g. Godrej and Prestige) may legitimately have projects with identical marketing
 * slugs (e.g. "skyline"), as their public routing paths remain distinct (/:developerSlug/:locationSlug/:projectSlug).
 * Conflicts only occur if the same developer attempts to reuse an existing project slug.
 */
export async function createProject(input: CreateProjectInput) {
  await ensureDeveloperExists(input.developerId);

  try {
    const project = await projectRepository.create(input);
    return { data: toAdminProject(project) };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AdminProjectError(
        "PROJECT_SLUG_EXISTS",
        409,
        "Project slug already exists for this developer",
      );
    }

    throw error;
  }
}

export async function listProjects() {
  const projects = await projectRepository.findMany();

  return {
    data: projects.map(toAdminProject),
  };
}

export async function getProjectById(id: string) {
  const project = await projectRepository.findById(id);

  if (!project) {
    throw new AdminProjectError(
      "PROJECT_NOT_FOUND",
      404,
      "Project not found",
    );
  }

  return {
    data: toAdminProject(project),
  };
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
) {
  const existing = await projectRepository.findById(id);

  if (!existing) {
    throw new AdminProjectError(
      "PROJECT_NOT_FOUND",
      404,
      "Project not found",
    );
  }

  if (
    input.developerId &&
    input.developerId !== existing.developerId
  ) {
    await ensureDeveloperExists(input.developerId);
  }

  try {
    const project = await projectRepository.update(id, input);

    return {
      data: toAdminProject(project),
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AdminProjectError(
        "PROJECT_SLUG_EXISTS",
        409,
        "Project slug already exists for this developer",
      );
    }

    throw error;
  }
}

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

function selectDeveloperBannerMedia(
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
  const banner =
    media.find((item) => item.category === "DEVELOPER_BANNER") ??
    media.find((item) => item.category === "CARD") ??
    media[0];
  return banner ? toPublicMedia(banner) : null;
}

export class ProjectNotFoundError extends Error {
  code = "PROJECT_NOT_FOUND";
  statusCode = 404;

  constructor() {
    super("Project not found");
    this.name = "ProjectNotFoundError";
  }
}

export async function getPublicProject(
  developerSlug: string,
  locationSlug: string,
  projectSlug: string,
) {
  const project = await projectRepository.findPublicProject(
    developerSlug,
    locationSlug,
    projectSlug,
  );

  if (!project) {
    throw new ProjectNotFoundError();
  }

  const developerBannerMedia = selectDeveloperBannerMedia(
    project.developer.media ?? [],
  );

  return {
    data: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,

      location: {
        name: project.locationName,
        slug: project.locationSlug,
        address: project.address,
        mapsUrl: project.mapsUrl,
      },

      status: project.status,
      featured: project.featured,

      developer: {
        id: project.developer.id,
        name: project.developer.name,
        slug: project.developer.slug,
        description: project.developer.description ?? null,
        logoUrl: project.developer.logoUrl,
        bannerMedia: developerBannerMedia,
      },

      highlights: project.highlights.map((highlight) => ({
        id: highlight.id,
        text: highlight.text,
        sortOrder: highlight.sortOrder,
      })),

      amenities: project.amenities.map((amenity) => ({
        id: amenity.id,
        name: amenity.name,
        sortOrder: amenity.sortOrder,
      })),

      configurations: project.configurations.map(
        (configuration) => ({
          id: configuration.id,
          name: configuration.name,
          bhk: configuration.bhk,
          carpetArea: configuration.carpetArea,
          builtUpArea: configuration.builtUpArea,
          superBuiltUpArea: configuration.superBuiltUpArea,
          priceFrom: configuration.priceFrom.toString(),
          availabilityStatus: configuration.availabilityStatus,
          media: configuration.media.map(toPublicMedia),
        }),
      ),

      media: project.media.map(toPublicMedia),
    },
  };
}

export type CreateAmenityInput = {
  name: string;
  sortOrder?: number;
};

export type UpdateAmenityInput = Partial<CreateAmenityInput>;

export async function listProjectAmenities(projectId: string) {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new AdminProjectError("PROJECT_NOT_FOUND", 404, "Project not found");
  }
  const amenities = await projectRepository.findAmenities(projectId);
  return { data: amenities };
}

const MAX_PROJECT_HIGHLIGHTS = 12;

export async function listProjectHighlights(projectId: string) {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new AdminProjectError("PROJECT_NOT_FOUND", 404, "Project not found");
  }
  return { data: await projectRepository.findHighlights(projectId) };
}

export async function createProjectHighlight(
  projectId: string,
  input: { text: string; sortOrder?: number },
) {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new AdminProjectError("PROJECT_NOT_FOUND", 404, "Project not found");
  }

  const text = input.text.trim();
  if (!text) {
    throw new AdminProjectError("INVALID_HIGHLIGHT_REQUEST", 400, "Highlight text is required");
  }

  const existingHighlights = await projectRepository.findHighlights(projectId);
  if (existingHighlights.length >= MAX_PROJECT_HIGHLIGHTS) {
    throw new AdminProjectError("INVALID_HIGHLIGHT_REQUEST", 400, "A project may have at most 12 highlights");
  }

  return {
    data: await projectRepository.createHighlight({
      projectId,
      text,
      sortOrder: input.sortOrder ?? existingHighlights.length,
    }),
  };
}

export async function updateProjectHighlight(
  projectId: string,
  highlightId: string,
  input: { text?: string; sortOrder?: number },
) {
  const highlight = await projectRepository.findHighlightById(highlightId);
  if (!highlight || highlight.projectId !== projectId) {
    throw new AdminProjectError("HIGHLIGHT_NOT_FOUND", 404, "Highlight not found for this project");
  }

  const data: { text?: string; sortOrder?: number } = {};
  if (input.text !== undefined) {
    const text = input.text.trim();
    if (!text) {
      throw new AdminProjectError("INVALID_HIGHLIGHT_REQUEST", 400, "Highlight text cannot be empty");
    }
    data.text = text;
  }
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

  return { data: await projectRepository.updateHighlight(highlightId, data) };
}

export async function deleteProjectHighlight(projectId: string, highlightId: string) {
  const highlight = await projectRepository.findHighlightById(highlightId);
  if (!highlight || highlight.projectId !== projectId) {
    throw new AdminProjectError("HIGHLIGHT_NOT_FOUND", 404, "Highlight not found for this project");
  }
  await projectRepository.deleteHighlight(highlightId);
  return { success: true };
}

export async function createProjectAmenity(
  projectId: string,
  input: CreateAmenityInput,
) {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new AdminProjectError("PROJECT_NOT_FOUND", 404, "Project not found");
  }

  const name = input.name.trim();
  if (!name) {
    throw new AdminProjectError("INVALID_AMENITY_REQUEST", 400, "Amenity name is required");
  }

  const existingAmenities = await projectRepository.findAmenities(projectId);
  if (existingAmenities.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
    throw new AdminProjectError("INVALID_AMENITY_REQUEST", 400, "An amenity with this name already exists in this project");
  }

  const amenity = await projectRepository.createAmenity({
    projectId,
    name,
    sortOrder: input.sortOrder ?? existingAmenities.length,
  });

  return { data: amenity };
}

export async function updateProjectAmenity(
  projectId: string,
  amenityId: string,
  input: UpdateAmenityInput,
) {
  const amenity = await projectRepository.findAmenityById(amenityId);
  if (!amenity || amenity.projectId !== projectId) {
    throw new AdminProjectError("AMENITY_NOT_FOUND", 404, "Amenity not found for this project");
  }

  const dataToUpdate: { name?: string; sortOrder?: number } = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new AdminProjectError("INVALID_AMENITY_REQUEST", 400, "Amenity name cannot be empty");
    }

    const existingAmenities = await projectRepository.findAmenities(projectId);
    if (
      existingAmenities.some(
        (a) => a.id !== amenityId && a.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      throw new AdminProjectError("INVALID_AMENITY_REQUEST", 400, "An amenity with this name already exists in this project");
    }

    dataToUpdate.name = name;
  }

  if (input.sortOrder !== undefined) {
    dataToUpdate.sortOrder = input.sortOrder;
  }

  const updated = await projectRepository.updateAmenity(amenityId, dataToUpdate);
  return { data: updated };
}

export async function deleteProjectAmenity(
  projectId: string,
  amenityId: string,
) {
  const amenity = await projectRepository.findAmenityById(amenityId);
  if (!amenity || amenity.projectId !== projectId) {
    throw new AdminProjectError("AMENITY_NOT_FOUND", 404, "Amenity not found for this project");
  }

  await projectRepository.deleteAmenity(amenityId);
  return { success: true };
}
