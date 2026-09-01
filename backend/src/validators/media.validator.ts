/*
 * PURPOSE:
 * Validation middlewares for admin media endpoints.
 *
 * FLOW:
 * Media Validation Flow
 *
 * RESPONSIBILITY:
 * Validates multipart/form-data upload fields, MIME types, owner IDs according to context rules,
 * and metadata update payloads.
 */

import type { NextFunction, Request, Response } from "express";

export type MediaUploadBody = {
  developerId?: unknown;
  projectId?: unknown;
  configurationId?: unknown;

  context?: unknown;
  slot?: unknown;

  type?: unknown;
  category?: unknown;

  title?: unknown;
  altText?: unknown;

  sortOrder?: unknown;
  isPrimary?: unknown;
};

export type MediaUpdateBody = {
  context?: unknown;
  slot?: unknown;

  category?: unknown;
  title?: unknown;
  altText?: unknown;

  sortOrder?: unknown;
  isPrimary?: unknown;
  isActive?: unknown;
};

const mediaTypes = new Set([
  "IMAGE",
  "DOCUMENT",
  "VIDEO",
]);

const mediaContexts = new Set([
  "HOME",
  "DEVELOPER",
  "PROJECT",
  "CONFIGURATION",
]);

const mediaCategories = new Set([
  "HERO",
  "HERO_CAROUSEL",
  "CARD",
  "GALLERY",
  "AMENITY",
  "EXTERIOR",
  "INTERIOR",
  "LOCATION",
  "CONSTRUCTION",
  "FLOOR_PLAN",
  "BROCHURE",
  "PROJECT_VIDEO",
  "DEVELOPER_BANNER",
  "DEVELOPER_HERO",
]);

const updateFields = [
  "context",
  "slot",
  "category",
  "title",
  "altText",
  "sortOrder",
  "isPrimary",
  "isActive",
];

function mediaValidationError(
  code: string,
  message: string,
) {
  const error = new Error(message);

  error.name = "MediaValidationError";

  Object.assign(error, {
    code,
    statusCode: 400,
  });

  return error;
}

function isNonEmptyString(value: unknown) {
  return (
    typeof value === "string" &&
    value.trim() !== ""
  );
}

function isNonNegativeInteger(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

function parseBoolean(value: unknown) {
  return (
    value === true ||
    value === "true" ||
    value === false ||
    value === "false"
  );
}

// Validates that required owner IDs are provided based strictly on the upload context
function validateContextOwnership(
  body: MediaUploadBody,
) {
  const context = body.context;

  const hasDeveloper =
    isNonEmptyString(body.developerId);

  const hasProject =
    isNonEmptyString(body.projectId);

  const hasConfiguration =
    isNonEmptyString(body.configurationId);

  /*
   * HOME media belongs to the firm itself.
   * It must not have an entity owner (no developer, project, or configuration).
   */
  if (context === "HOME") {
    return !hasDeveloper &&
      !hasProject &&
      !hasConfiguration;
  }

  /*
   * DEVELOPER media requires a developerId.
   */
  if (context === "DEVELOPER") {
    return hasDeveloper;
  }

  /*
   * PROJECT media requires a projectId (and developerId).
   */
  if (context === "PROJECT") {
    return hasProject;
  }

  /*
   * CONFIGURATION media requires a configurationId (and developerId, projectId).
   */
  if (context === "CONFIGURATION") {
    return hasConfiguration;
  }

  return false;
}

// Ensures that the uploaded file MIME type matches the declared MediaType
function isCompatibleMimeType(
  type: unknown,
  mimeType: string,
) {
  if (type === "IMAGE") {
    return mimeType.startsWith("image/");
  }

  if (type === "VIDEO") {
    return mimeType.startsWith("video/");
  }

  if (type === "DOCUMENT") {
    return (
      !mimeType.startsWith("image/") &&
      !mimeType.startsWith("video/")
    );
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
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Media file is required",
      ),
    );
    return;
  }

  /*
   * Context is required for every new media upload.
   */
  if (
    typeof body.context !== "string" ||
    !mediaContexts.has(body.context)
  ) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Invalid media context",
      ),
    );
    return;
  }

  /*
   * Context determines the required ownership.
   */
  if (!validateContextOwnership(body)) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_OWNER",
        "Media ownership does not match its context",
      ),
    );
    return;
  }

  /*
   * Slot is optional, but when provided it must
   * contain a non-empty string.
   */
  if (
    body.slot !== undefined &&
    !isNonEmptyString(body.slot)
  ) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Invalid media slot",
      ),
    );
    return;
  }

  if (
    typeof body.type !== "string" ||
    !mediaTypes.has(body.type) ||

    typeof body.category !== "string" ||
    !mediaCategories.has(body.category) ||

    !isCompatibleMimeType(
      body.type,
      file.mimetype,
    ) ||

    (
      body.title !== undefined &&
      typeof body.title !== "string"
    ) ||

    (
      body.altText !== undefined &&
      typeof body.altText !== "string"
    ) ||

    (
      body.sortOrder !== undefined &&
      !isNonNegativeInteger(
        Number(body.sortOrder),
      )
    ) ||

    (
      body.isPrimary !== undefined &&
      !parseBoolean(body.isPrimary)
    )
  ) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Invalid media metadata",
      ),
    );
    return;
  }

  next();
}

export function validateMediaUrlCreation(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as MediaUploadBody & { url?: unknown };

  if (typeof body.url !== "string" || body.url.trim() === "") {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Media URL is required",
      ),
    );
    return;
  }

  if (
    typeof body.context !== "string" ||
    !mediaContexts.has(body.context)
  ) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Invalid media context",
      ),
    );
    return;
  }

  if (!validateContextOwnership(body)) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_OWNER",
        "Media ownership does not match its context",
      ),
    );
    return;
  }

  if (
    typeof body.type !== "string" ||
    !mediaTypes.has(body.type) ||
    typeof body.category !== "string" ||
    !mediaCategories.has(body.category) ||
    (body.title !== undefined && typeof body.title !== "string") ||
    (body.altText !== undefined && typeof body.altText !== "string") ||
    (body.sortOrder !== undefined &&
      !isNonNegativeInteger(Number(body.sortOrder))) ||
    (body.isPrimary !== undefined && !parseBoolean(body.isPrimary))
  ) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Invalid media metadata",
      ),
    );
    return;
  }

  next();
}

export function validateMediaId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (
    typeof req.params.id !== "string" ||
    req.params.id.trim() === ""
  ) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Media id is required",
      ),
    );
    return;
  }

  next();
}

export function validateMediaOwnerParam(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const owner =
    req.params.projectId ??
    req.params.configurationId ??
    req.params.developerId;

  if (
    typeof owner !== "string" ||
    owner.trim() === ""
  ) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Media owner id is required",
      ),
    );
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

  const hasOnlyAllowedFields =
    Object.keys(body).every((key) =>
      updateFields.includes(key),
    );

  if (
    !hasOnlyAllowedFields ||

    (
      body.context !== undefined &&
      (
        typeof body.context !== "string" ||
        !mediaContexts.has(body.context)
      )
    ) ||

    (
      body.slot !== undefined &&
      body.slot !== null &&
      typeof body.slot !== "string"
    ) ||

    (
      body.category !== undefined &&
      (
        typeof body.category !== "string" ||
        !mediaCategories.has(body.category)
      )
    ) ||

    (
      body.title !== undefined &&
      body.title !== null &&
      typeof body.title !== "string"
    ) ||

    (
      body.altText !== undefined &&
      body.altText !== null &&
      typeof body.altText !== "string"
    ) ||

    (
      body.sortOrder !== undefined &&
      !isNonNegativeInteger(body.sortOrder)
    ) ||

    (
      body.isPrimary !== undefined &&
      typeof body.isPrimary !== "boolean"
    ) ||

    (
      body.isActive !== undefined &&
      typeof body.isActive !== "boolean"
    )
  ) {
    next(
      mediaValidationError(
        "INVALID_MEDIA_REQUEST",
        "Invalid media update fields",
      ),
    );
    return;
  }

  next();
}