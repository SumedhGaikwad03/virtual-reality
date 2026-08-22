import type {
  MediaCategory,
  MediaType,
} from "../../generated/prisma/enums.js";
import {
  deleteUploadedAsset,
  uploadMediaBuffer,
} from "../lib/cloudinary.js";
import { configurationRepository } from "../repositories/configuration.repository.js";
import { mediaRepository } from "../repositories/media.repository.js";
import { projectRepository } from "../repositories/project.repository.js";

export type MediaUploadInput = {
  projectId?: string;
  configurationId?: string;
  type: MediaType;
  category: MediaCategory;
  title?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type MediaUpdateInput = {
  category?: MediaCategory;
  title?: string | null;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
  isActive?: boolean;
};

export class MediaServiceError extends Error {
  constructor(
    public readonly code:
      | "INVALID_MEDIA_OWNER"
      | "PROJECT_NOT_FOUND"
      | "CONFIGURATION_NOT_FOUND"
      | "MEDIA_NOT_FOUND",
    public readonly statusCode: 400 | 404,
    message: string,
  ) {
    super(message);
    this.name = "MediaServiceError";
  }
}

function toMediaResponse(media: {
  id: string;
  projectId: string | null;
  configurationId: string | null;
  type: MediaType;
  category: MediaCategory;
  title: string | null;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;
  source: string;
  sourceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: media.id,
    projectId: media.projectId,
    configurationId: media.configurationId,
    type: media.type,
    category: media.category,
    title: media.title,
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    altText: media.altText,
    sortOrder: media.sortOrder,
    isPrimary: media.isPrimary,
    isActive: media.isActive,
    source: media.source,
    sourceUrl: media.sourceUrl,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
  };
}

function validateOwner(input: MediaUploadInput) {
  const hasProject = Boolean(input.projectId);
  const hasConfiguration = Boolean(input.configurationId);

  if (hasProject === hasConfiguration) {
    throw new MediaServiceError(
      "INVALID_MEDIA_OWNER",
      400,
      "Media must belong to either a project or a configuration",
    );
  }
}

function resourceType(type: MediaType): "image" | "video" | "raw" {
  if (type === "IMAGE") return "image";
  if (type === "VIDEO") return "video";
  return "raw";
}

async function ensureOwnerExists(input: MediaUploadInput) {
  if (input.projectId) {
    if (!(await projectRepository.findById(input.projectId))) {
      throw new MediaServiceError("PROJECT_NOT_FOUND", 404, "Project not found");
    }
    return input.projectId;
  }

  if (input.configurationId) {
    if (!(await configurationRepository.findById(input.configurationId))) {
      throw new MediaServiceError(
        "CONFIGURATION_NOT_FOUND",
        404,
        "Configuration not found",
      );
    }
    return input.configurationId;
  }

  throw new MediaServiceError(
    "INVALID_MEDIA_OWNER",
    400,
    "Media must belong to either a project or a configuration",
  );
}

export async function uploadMedia(
  file: Express.Multer.File,
  input: MediaUploadInput,
) {
  validateOwner(input);
  const ownerId = await ensureOwnerExists(input);
  const folder = input.projectId
    ? `virtual-reality/projects/${ownerId}`
    : `virtual-reality/configurations/${ownerId}`;
  const cloudinaryResourceType = resourceType(input.type);
  const uploaded = await uploadMediaBuffer(
    file.buffer,
    folder,
    cloudinaryResourceType,
  );

  try {
    const media = await mediaRepository.create({
      projectId: input.projectId,
      configurationId: input.configurationId,
      type: input.type,
      category: input.category,
      title: input.title,
      url: uploaded.secure_url,
      altText: input.altText,
      sortOrder: input.sortOrder,
      isPrimary: input.isPrimary,
      source: "MANUAL",
    });
    return { data: toMediaResponse(media) };
  } catch (error) {
    try {
      await deleteUploadedAsset(uploaded.public_id, cloudinaryResourceType);
    } catch {
      console.warn("Failed to clean up Cloudinary media after database failure");
    }
    throw error;
  }
}

export async function listProjectMedia(projectId: string) {
  if (!(await projectRepository.findById(projectId))) {
    throw new MediaServiceError("PROJECT_NOT_FOUND", 404, "Project not found");
  }
  const media = await mediaRepository.findByProjectId(projectId);
  return { data: media.map(toMediaResponse) };
}

export async function listConfigurationMedia(configurationId: string) {
  if (!(await configurationRepository.findById(configurationId))) {
    throw new MediaServiceError(
      "CONFIGURATION_NOT_FOUND",
      404,
      "Configuration not found",
    );
  }
  const media = await mediaRepository.findByConfigurationId(configurationId);
  return { data: media.map(toMediaResponse) };
}

export async function getMediaById(id: string) {
  const media = await mediaRepository.findById(id);
  if (!media) {
    throw new MediaServiceError("MEDIA_NOT_FOUND", 404, "Media not found");
  }
  return { data: toMediaResponse(media) };
}

export async function updateMedia(id: string, input: MediaUpdateInput) {
  const existing = await mediaRepository.findById(id);
  if (!existing) {
    throw new MediaServiceError("MEDIA_NOT_FOUND", 404, "Media not found");
  }
  const media = await mediaRepository.update(id, input);
  return { data: toMediaResponse(media) };
}
