import { projectRepository } from "../repositories/project.repository.js";
import { developerRepository } from "../repositories/developer.repository.js";
import type { ProjectStatus } from "../../generated/prisma/enums.js";

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
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export class AdminProjectError extends Error {
  constructor(
    public readonly code:
      | "PROJECT_NOT_FOUND"
      | "DEVELOPER_NOT_FOUND"
      | "PROJECT_SLUG_EXISTS",
    public readonly statusCode: 404 | 409,
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
  developer: { id: string; name: string; slug: string };
  name: string;
  slug: string;
  description: string | null;
  locationName: string;
  locationSlug: string;
  address: string;
  mapsUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
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
        "Project slug already exists",
      );
    }
    throw error;
  }
}

export async function listProjects() {
  const projects = await projectRepository.findMany();
  return { data: projects.map(toAdminProject) };
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

  return { data: toAdminProject(project) };
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const existing = await projectRepository.findById(id);

  if (!existing) {
    throw new AdminProjectError(
      "PROJECT_NOT_FOUND",
      404,
      "Project not found",
    );
  }

  if (input.developerId && input.developerId !== existing.developerId) {
    await ensureDeveloperExists(input.developerId);
  }

  try {
    const project = await projectRepository.update(id, input);
    return { data: toAdminProject(project) };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AdminProjectError(
        "PROJECT_SLUG_EXISTS",
        409,
        "Project slug already exists",
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
        logoUrl: project.developer.logoUrl,
      },
      configurations: project.configurations.map((configuration) => ({
        id: configuration.id,
        name: configuration.name,
        bhk: configuration.bhk,
        carpetArea: configuration.carpetArea,
        builtUpArea: configuration.builtUpArea,
        superBuiltUpArea: configuration.superBuiltUpArea,
        priceFrom: configuration.priceFrom.toString(),
        availabilityStatus: configuration.availabilityStatus,
        media: configuration.media.map(toPublicMedia),
      })),
      media: project.media.map(toPublicMedia),
    },
  };
}
