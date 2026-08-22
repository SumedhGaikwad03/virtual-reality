import express, { Router } from "express";
import multer from "multer";
import {
  getMediaController,
  listConfigurationMediaController,
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
} from "../../validators/media.validator.js";

const maxFileSize = Number(process.env.MEDIA_MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number.isSafeInteger(maxFileSize) && maxFileSize > 0 ? maxFileSize : 10 * 1024 * 1024 },
});

const router = Router();
router.use(requireAdminAuthentication);
router.use(express.json());

router.post("/", upload.single("file"), validateMediaUpload, uploadMediaController);
router.get(
  "/project/:projectId",
  validateMediaOwnerParam,
  listProjectMediaController,
);
router.get(
  "/configuration/:configurationId",
  validateMediaOwnerParam,
  listConfigurationMediaController,
);
router.get("/:id", validateMediaId, getMediaController);
router.patch("/:id", validateMediaId, validateMediaUpdate, updateMediaController);

export default router;
