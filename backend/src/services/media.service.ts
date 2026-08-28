/*
 * PURPOSE:
 * Media application service layer.
 *
 * FLOW:
 * Media Business Logic Flow
 *
 * RESPONSIBILITY:
 * Encapsulates core business rules and workflows for media management:
 * - Validates hierarchical entity ownership by context (HOME, DEVELOPER, PROJECT, CONFIGURATION).
 * - Maps media types to Cloudinary resource types (IMAGE -> image, VIDEO -> video, DOCUMENT -> raw).
 * - Directs uploads to context-specific Cloudinary folders.
 * - Handles Cloudinary upload buffer streaming and database persistence.
 * - Performs asset cleanup rollback on Cloudinary if database write fails.
 * - Provides context, developer, project, and configuration listing and metadata updates.
 */

import type {
  MediaCategory,
  MediaContext,
  MediaType,
} from "../../generated/prisma/enums.js";

import {
  deleteUploadedAsset,
  uploadMediaBuffer,
} from "../lib/cloudinary.js";

import { configurationRepository } from "../repositories/configuration.repository.js";
import { developerRepository } from "../repositories/developer.repository.js";
import { mediaRepository } from "../repositories/media.repository.js";
import { projectRepository } from "../repositories/project.repository.js";

export type MediaUploadInput = {
  developerId?: string;
  projectId?: string;
  configurationId?: string;

  context: MediaContext;
  slot?: string;

  type: MediaType;
  category: MediaCategory;

  title?: string;
  altText?: string;

  sortOrder?: number;
  isPrimary?: boolean;
};

export type MediaUpdateInput = {
  context?: MediaContext;
  slot?: string | null;

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
      | "DEVELOPER_NOT_FOUND"
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

  developerId: string | null;
  projectId: string | null;
  configurationId: string | null;

  context: MediaContext;
  slot: string | null;

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

    developerId: media.developerId,
    projectId: media.projectId,
    configurationId: media.configurationId,

    context: media.context,
    slot: media.slot,

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

// Validates that the entity ownership hierarchy exists in the database according to the context
async function validateOwnership(input: MediaUploadInput) {
  const {
    developerId,
    projectId,
    configurationId,
    context,
  } = input;

  /*
   * HOME
   * Site-level media belongs to the firm itself and has no owner.
   */
  if (context === "HOME") {
    if (
      developerId ||
      projectId ||
      configurationId
    ) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "HOME media cannot belong to a developer, project, or configuration",
      );
    }

    return;
  }

  /*
   * DEVELOPER
   * Developer media belongs only to a developer.
   */
  if (context === "DEVELOPER") {
    if (!developerId) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "DEVELOPER media requires a developer",
      );
    }

    if (projectId || configurationId) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "DEVELOPER media cannot belong to a project or configuration",
      );
    }

    const developer =
      await developerRepository.findById(
        developerId,
      );

    if (!developer) {
      throw new MediaServiceError(
        "DEVELOPER_NOT_FOUND",
        404,
        "Developer not found",
      );
    }

    return;
  }

  /*
   * PROJECT
   * Project media belongs to a project and must identify its developer.
   */
  if (context === "PROJECT") {
    if (!developerId || !projectId) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "PROJECT media requires a developer and project",
      );
    }

    if (configurationId) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "PROJECT media cannot belong to a configuration",
      );
    }

    const developer =
      await developerRepository.findById(
        developerId,
      );

    if (!developer) {
      throw new MediaServiceError(
        "DEVELOPER_NOT_FOUND",
        404,
        "Developer not found",
      );
    }

    const project =
      await projectRepository.findById(
        projectId,
      );

    if (!project) {
      throw new MediaServiceError(
        "PROJECT_NOT_FOUND",
        404,
        "Project not found",
      );
    }

    if (
      project.developerId !== developerId
    ) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "Project does not belong to the specified developer",
      );
    }

    return;
  }

  /*
   * CONFIGURATION
   * Configuration media must identify the complete ownership chain:
   * Developer -> Project -> Configuration
   */
  if (context === "CONFIGURATION") {
    if (
      !developerId ||
      !projectId ||
      !configurationId
    ) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "CONFIGURATION media requires a developer, project, and configuration",
      );
    }

    const developer =
      await developerRepository.findById(
        developerId,
      );

    if (!developer) {
      throw new MediaServiceError(
        "DEVELOPER_NOT_FOUND",
        404,
        "Developer not found",
      );
    }

    const project =
      await projectRepository.findById(
        projectId,
      );

    if (!project) {
      throw new MediaServiceError(
        "PROJECT_NOT_FOUND",
        404,
        "Project not found",
      );
    }

    if (
      project.developerId !== developerId
    ) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "Project does not belong to the specified developer",
      );
    }

    const configuration =
      await configurationRepository.findById(
        configurationId,
      );

    if (!configuration) {
      throw new MediaServiceError(
        "CONFIGURATION_NOT_FOUND",
        404,
        "Configuration not found",
      );
    }

    if (
      configuration.projectId !== projectId
    ) {
      throw new MediaServiceError(
        "INVALID_MEDIA_OWNER",
        400,
        "Configuration does not belong to the specified project",
      );
    }

    return;
  }

  throw new MediaServiceError(
    "INVALID_MEDIA_OWNER",
    400,
    "Invalid media context",
  );
}

// Maps MediaType to Cloudinary resource_type
function resourceType(
  type: MediaType,
): "image" | "video" | "raw" {
  if (type === "IMAGE") {
    return "image";
  }

  if (type === "VIDEO") {
    return "video";
  }

  return "raw";
}

// Determines the destination Cloudinary folder path partitioned by context and owner
function getCloudinaryFolder(
  input: MediaUploadInput,
) {
  if (input.context === "HOME") {
    return "virtual-reality/home";
  }

  if (input.context === "DEVELOPER") {
    return `virtual-reality/developers/${input.developerId}`;
  }

  if (input.context === "PROJECT") {
    return `virtual-reality/projects/${input.projectId}`;
  }

  if (input.context === "CONFIGURATION") {
    return `virtual-reality/configurations/${input.configurationId}`;
  }

  return "virtual-reality/home";
}

export async function uploadMedia(
  file: Express.Multer.File,
  input: MediaUploadInput,
) {
  await validateOwnership(input);

  const cloudinaryResourceType =
    resourceType(input.type);

  const folder =
    getCloudinaryFolder(input);

  const uploaded =
    await uploadMediaBuffer(
      file.buffer,
      folder,
      cloudinaryResourceType,
    );

  try {
    const media =
      await mediaRepository.create({
        developerId: input.developerId,
        projectId: input.projectId,
        configurationId:
          input.configurationId,

        context: input.context,
        slot: input.slot,

        type: input.type,
        category: input.category,

        title: input.title,
        url: uploaded.secure_url,
        altText: input.altText,

        sortOrder: input.sortOrder,
        isPrimary: input.isPrimary,

        source: "MANUAL",
      });

    return {
      data: toMediaResponse(media),
    };
  } catch (error) {
    /*
     * Upload Rollback:
     * If Cloudinary upload succeeds but database persistence fails, delete the uploaded CDN asset
     * to avoid orphaned files and storage leakage.
     */
    try {
      await deleteUploadedAsset(
        uploaded.public_id,
        cloudinaryResourceType,
      );
    } catch {
      console.warn(
        "Failed to clean up Cloudinary media after database failure",
      );
    }

    throw error;
  }
}

export async function listDeveloperMedia(
  developerId: string,
) {
  if (
    !(await developerRepository.findById(
      developerId,
    ))
  ) {
    throw new MediaServiceError(
      "DEVELOPER_NOT_FOUND",
      404,
      "Developer not found",
    );
  }

  const media =
    await mediaRepository.findByDeveloperId(
      developerId,
    );

  return {
    data: media.map(toMediaResponse),
  };
}

export async function listProjectMedia(
  projectId: string,
) {
  if (
    !(await projectRepository.findById(
      projectId,
    ))
  ) {
    throw new MediaServiceError(
      "PROJECT_NOT_FOUND",
      404,
      "Project not found",
    );
  }

  const media =
    await mediaRepository.findByProjectId(
      projectId,
    );

  return {
    data: media.map(toMediaResponse),
  };
}

export async function listConfigurationMedia(
  configurationId: string,
) {
  if (
    !(await configurationRepository.findById(
      configurationId,
    ))
  ) {
    throw new MediaServiceError(
      "CONFIGURATION_NOT_FOUND",
      404,
      "Configuration not found",
    );
  }

  const media =
    await mediaRepository.findByConfigurationId(
      configurationId,
    );

  return {
    data: media.map(toMediaResponse),
  };
}

export async function listContextMedia(
  context: MediaContext,
  slot?: string,
) {
  const media =
    await mediaRepository.findByContext(
      context,
      slot,
    );

  return {
    data: media.map(toMediaResponse),
  };
}

export async function getMediaById(
  id: string,
) {
  const media =
    await mediaRepository.findById(id);

  if (!media) {
    throw new MediaServiceError(
      "MEDIA_NOT_FOUND",
      404,
      "Media not found",
    );
  }

  return {
    data: toMediaResponse(media),
  };
}

export async function updateMedia(
  id: string,
  input: MediaUpdateInput,
) {
  const existing =
    await mediaRepository.findById(id);

  if (!existing) {
    throw new MediaServiceError(
      "MEDIA_NOT_FOUND",
      404,
      "Media not found",
    );
  }

  const media =
    await mediaRepository.update(
      id,
      input,
    );

  return {
    data: toMediaResponse(media),
  };
}