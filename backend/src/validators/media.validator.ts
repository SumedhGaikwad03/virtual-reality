import type { NextFunction, Request, Response } from "express";

export type MediaUploadBody = {
  projectId?: unknown;
  configurationId?: unknown;
  type?: unknown;
  category?: unknown;
  title?: unknown;
  altText?: unknown;
  sortOrder?: unknown;
  isPrimary?: unknown;
};

export type MediaUpdateBody = {
  category?: unknown;
  title?: unknown;
  altText?: unknown;
  sortOrder?: unknown;
  isPrimary?: unknown;
  isActive?: unknown;
};

const mediaTypes = new Set(["IMAGE", "DOCUMENT", "VIDEO"]);
const mediaCategories = new Set([
  "HERO",
  "HERO_CAROUSEL",
  "GALLERY",
  "AMENITY",
  "EXTERIOR",
  "INTERIOR",
  "LOCATION",
  "CONSTRUCTION",
  "FLOOR_PLAN",
  "BROCHURE",
  "PROJECT_VIDEO",
]);
const updateFields = [
  "category",
  "title",
  "altText",
  "sortOrder",
  "isPrimary",
  "isActive",
];

function mediaValidationError(code: string, message: string) {
  const error = new Error(message);
  error.name = "MediaValidationError";
  Object.assign(error, { code, statusCode: 400 });
  return error;
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() !== "";
}

function isNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function parseBoolean(value: unknown) {
  return value === true || value === "true" || value === false || value === "false";
}

function hasExactlyOneOwner(body: MediaUploadBody) {
  const hasProject = isNonEmptyString(body.projectId);
  const hasConfiguration = isNonEmptyString(body.configurationId);
  return hasProject !== hasConfiguration;
}

function isCompatibleMimeType(type: unknown, mimeType: string) {
  if (type === "IMAGE") return mimeType.startsWith("image/");
  if (type === "VIDEO") return mimeType.startsWith("video/");
  if (type === "DOCUMENT") {
    return !mimeType.startsWith("image/") && !mimeType.startsWith("video/");
  }
  return false;
}

export function validateMediaUpload(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as MediaUploadBody;
  const file = req.file;

  if (!file) {
    next(mediaValidationError("INVALID_MEDIA_REQUEST", "Media file is required"));
    return;
  }

  if (!hasExactlyOneOwner(body)) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_OWNER",
        "Media must belong to either a project or a configuration",
      ),
    );
    return;
  }

  if (
    typeof body.type !== "string" ||
    !mediaTypes.has(body.type) ||
    typeof body.category !== "string" ||
    !mediaCategories.has(body.category) ||
    !isCompatibleMimeType(body.type, file.mimetype) ||
    (body.title !== undefined && typeof body.title !== "string") ||
    (body.altText !== undefined && typeof body.altText !== "string") ||
    (body.sortOrder !== undefined &&
      !isNonNegativeInteger(Number(body.sortOrder))) ||
    (body.isPrimary !== undefined && !parseBoolean(body.isPrimary))
  ) {
    next(mediaValidationError("INVALID_MEDIA_REQUEST", "Invalid media metadata"));
    return;
  }

  next();
}

export function validateMediaId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (typeof req.params.id !== "string" || req.params.id.trim() === "") {
    next(mediaValidationError("INVALID_MEDIA_REQUEST", "Media id is required"));
    return;
  }
  next();
}

export function validateMediaOwnerParam(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const owner = req.params.projectId ?? req.params.configurationId;
  if (typeof owner !== "string" || owner.trim() === "") {
    next(mediaValidationError("INVALID_MEDIA_REQUEST", "Media owner id is required"));
    return;
  }
  next();
}

export function validateMediaUpdate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as MediaUpdateBody;
  const hasOnlyAllowedFields = Object.keys(body).every((key) =>
    updateFields.includes(key),
  );

  if (
    !hasOnlyAllowedFields ||
    (body.category !== undefined &&
      (typeof body.category !== "string" || !mediaCategories.has(body.category))) ||
    (body.title !== undefined && body.title !== null && typeof body.title !== "string") ||
    (body.altText !== undefined && body.altText !== null && typeof body.altText !== "string") ||
    (body.sortOrder !== undefined && !isNonNegativeInteger(body.sortOrder)) ||
    (body.isPrimary !== undefined && typeof body.isPrimary !== "boolean") ||
    (body.isActive !== undefined && typeof body.isActive !== "boolean")
  ) {
    next(mediaValidationError("INVALID_MEDIA_REQUEST", "Invalid media update fields"));
    return;
  }

  next();
}
