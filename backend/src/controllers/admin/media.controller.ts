import type { NextFunction, Request, Response } from "express";
import type {
  MediaCategory,
  MediaType,
} from "../../../generated/prisma/enums.js";
import {
  getMediaById,
  listConfigurationMedia,
  listProjectMedia,
  updateMedia,
  uploadMedia,
  type MediaUpdateInput,
} from "../../services/media.service.js";
import type {
  MediaUpdateBody,
  MediaUploadBody,
} from "../../validators/media.validator.js";

type MediaIdParams = { id: string };
type ProjectMediaParams = { projectId: string };
type ConfigurationMediaParams = { configurationId: string };

function multipartBoolean(value: unknown) {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return undefined;
}

function multipartInteger(value: unknown) {
  return value === undefined ? undefined : Number(value);
}

export async function uploadMediaController(
  req: Request<{}, unknown, MediaUploadBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    res.status(201).json(
      await uploadMedia(req.file as Express.Multer.File, {
        projectId: body.projectId as string | undefined,
        configurationId: body.configurationId as string | undefined,
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

export async function listProjectMediaController(
  req: Request<ProjectMediaParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await listProjectMedia(req.params.projectId));
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
      await listConfigurationMedia(req.params.configurationId),
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
    res.status(200).json(await getMediaById(req.params.id));
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
      await updateMedia(req.params.id, req.body as MediaUpdateInput),
    );
  } catch (error) {
    next(error);
  }
}
