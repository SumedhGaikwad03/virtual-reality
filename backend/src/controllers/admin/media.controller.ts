/*
 * PURPOSE:
 * Admin media HTTP controller.
 *
 * FLOW:
 * Media HTTP Flow
 *
 * RESPONSIBILITY:
 * Handles incoming HTTP requests for media upload, context queries, owner queries, and updates,
 * parsing multipart values and invoking the application service layer.
 */

import type { NextFunction, Request, Response } from "express";
import type {
  MediaCategory,
  MediaContext,
  MediaType,
} from "../../../generated/prisma/enums.js";

import {
  createMediaFromUrl,
  getMediaById,
  listConfigurationMedia,
  listContextMedia,
  listDeveloperMedia,
  listProjectMedia,
  updateMedia,
  uploadMedia,
  type MediaUpdateInput,
} from "../../services/media.service.js";

import type {
  MediaUpdateBody,
  MediaUploadBody,
} from "../../validators/media.validator.js";

type MediaIdParams = {
  id: string;
};

type DeveloperMediaParams = {
  developerId: string;
};

type ProjectMediaParams = {
  projectId: string;
};

type ConfigurationMediaParams = {
  configurationId: string;
};

type ContextMediaParams = {
  context: MediaContext;
};

type ContextMediaQuery = {
  slot?: string;
};

// Converts multipart form string representation to boolean value
function multipartBoolean(value: unknown) {
  if (value === "true" || value === true) {
    return true;
  }

  if (value === "false" || value === false) {
    return false;
  }

  return undefined;
}

// Converts multipart form string representation to integer value
function multipartInteger(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function uploadMediaController(
  req: Request<{}, unknown, MediaUploadBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;

    if (!req.file) {
      throw new Error("Media file is required");
    }

    res.status(201).json(
      await uploadMedia(req.file, {
        developerId: body.developerId as string | undefined,
        projectId: body.projectId as string | undefined,
        configurationId:
          body.configurationId as string | undefined,

        context: body.context as MediaContext,
        slot: body.slot as string | undefined,

        type: body.type as MediaType,
        category: body.category as MediaCategory,

        title: body.title as string | undefined,
        altText: body.altText as string | undefined,

        sortOrder: multipartInteger(body.sortOrder),
        isPrimary: multipartBoolean(body.isPrimary),
      }),
    );
  } catch (error) {
    next(error);
  }
}

export async function createMediaFromUrlController(
  req: Request<{}, unknown, MediaUploadBody & { url: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;

    res.status(201).json(
      await createMediaFromUrl({
        developerId: body.developerId as string | undefined,
        projectId: body.projectId as string | undefined,
        configurationId: body.configurationId as string | undefined,

        context: body.context as MediaContext,
        slot: body.slot as string | undefined,

        type: body.type as MediaType,
        category: body.category as MediaCategory,

        title: body.title as string | undefined,
        url: body.url,
        altText: body.altText as string | undefined,

        sortOrder: multipartInteger(body.sortOrder),
        isPrimary: multipartBoolean(body.isPrimary),
      }),
    );
  } catch (error) {
    next(error);
  }
}

export async function listDeveloperMediaController(
  req: Request<DeveloperMediaParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await listDeveloperMedia(req.params.developerId),
    );
  } catch (error) {
    next(error);
  }
}

export async function listProjectMediaController(
  req: Request<ProjectMediaParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await listProjectMedia(req.params.projectId),
    );
  } catch (error) {
    next(error);
  }
}

export async function listConfigurationMediaController(
  req: Request<ConfigurationMediaParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await listConfigurationMedia(
        req.params.configurationId,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function listContextMediaController(
  req: Request<
    ContextMediaParams,
    unknown,
    unknown,
    ContextMediaQuery
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await listContextMedia(
        req.params.context,
        req.query.slot,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function getMediaController(
  req: Request<MediaIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await getMediaById(req.params.id),
    );
  } catch (error) {
    next(error);
  }
}

export async function updateMediaController(
  req: Request<MediaIdParams, unknown, MediaUpdateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await updateMedia(
        req.params.id,
        req.body as MediaUpdateInput,
      ),
    );
  } catch (error) {
    next(error);
  }
}