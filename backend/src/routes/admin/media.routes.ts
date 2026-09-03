/*
 * PURPOSE:
 * Admin media route definitions.
 *
 * FLOW:
 * Admin Media Routing Flow
 *
 * RESPONSIBILITY:
 * Mounts authenticated admin endpoints for media:
 * - POST /: Uploads media files via Multer memory storage and validates context ownership.
 * - GET / & GET /context/:context: Retrieves media by context and optional slot.
 * - GET /developer/:developerId: Retrieves media for a specific developer.
 * - GET /project/:projectId: Retrieves media for a specific project.
 * - GET /configuration/:configurationId: Retrieves media for a specific configuration.
 * - GET /:id: Retrieves single media asset by ID.
 * - PATCH /:id: Updates media metadata or activation status.
 */

import express, { Router } from "express";
import multer from "multer";

import {
  createMediaFromUrlController,
  getMediaController,
  listConfigurationMediaController,
  listContextMediaController,
  listDeveloperMediaController,
  listHomeMediaController,
  listProjectMediaController,
  updateMediaController,
  uploadMediaController,
} from "../../controllers/admin/media.controller.js";

import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";

import {
  validateMediaId,
  validateMediaOwnerParam,
  validateMediaUpdate,
  validateMediaUpload,
  validateMediaUrlCreation,
} from "../../validators/media.validator.js";

const maxFileSize = Number(
  process.env.MEDIA_MAX_FILE_SIZE_BYTES ??
    10 * 1024 * 1024,
);

// Stores uploaded files temporarily in memory as buffers before streaming directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize:
      Number.isSafeInteger(maxFileSize) &&
      maxFileSize > 0
        ? maxFileSize
        : 10 * 1024 * 1024,
  },
});

const router = Router();

router.use(requireAdminAuthentication);
router.use(express.json());

/*
 * Upload media
 *
 * Supports contexts:
 * HOME, DEVELOPER, PROJECT, CONFIGURATION
 */
router.post(
  "/",
  upload.single("file"),
  validateMediaUpload,
  uploadMediaController,
);

/*
 * Create media from URL (e.g. YouTube / Vimeo video URL)
 */
router.post(
  "/url",
  validateMediaUrlCreation,
  createMediaFromUrlController,
);

/*
 * Context-based media using query parameters.
 *
 * Examples:
 * GET /admin/media?context=HOME
 * GET /admin/media?context=HOME&slot=hero
 * GET /admin/media?context=DEVELOPER
 * GET /admin/media?context=PROJECT
 * GET /admin/media?context=CONFIGURATION
 */
router.get(
  "/",
  listHomeMediaController,
);

/*
 * Context-based media using path parameter.
 *
 * Examples:
 * GET /admin/media/context/HOME
 * GET /admin/media/context/DEVELOPER
 * GET /admin/media/context/PROJECT
 * GET /admin/media/context/CONFIGURATION
 */
router.get(
  "/context/:context",
  listContextMediaController,
);

/*
 * Developer media
 *
 * GET /admin/media/developer/:developerId
 */
router.get(
  "/developer/:developerId",
  validateMediaOwnerParam,
  listDeveloperMediaController,
);

/*
 * Project media
 *
 * GET /admin/media/project/:projectId
 */
router.get(
  "/project/:projectId",
  validateMediaOwnerParam,
  listProjectMediaController,
);

/*
 * Configuration media
 *
 * GET /admin/media/configuration/:configurationId
 */
router.get(
  "/configuration/:configurationId",
  validateMediaOwnerParam,
  listConfigurationMediaController,
);

/*
 * Individual media
 *
 * GET /admin/media/:id
 */
router.get(
  "/:id",
  validateMediaId,
  getMediaController,
);

/*
 * Update media metadata / activation status
 *
 * PATCH /admin/media/:id
 */
router.patch(
  "/:id",
  validateMediaId,
  validateMediaUpdate,
  updateMediaController,
);

export default router;
