/*
 * PURPOSE:
 * Admin firm profile route definitions.
 *
 * FLOW:
 * Admin HTTP Request -> firm-profile.routes -> firm-profile.controller -> firm-profile.repository.
 *
 * RESPONSIBILITY:
 * Mounts authenticated admin endpoints for reading and updating company overview and founder profile details.
 */

import express, { Router } from "express";
import {
  getFirmProfileController,
  updateFirmProfileController,
} from "../../controllers/admin/firm-profile.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import { validateFirmProfileUpdate } from "../../validators/firm-profile.validator.js";

const router = Router();

router.use(requireAdminAuthentication);
router.use(express.json());

/*
 * GET /api/admin/firm-profile
 * Retrieve current persisted company overview and founder profile
 */
router.get("/", getFirmProfileController);

/*
 * PATCH /api/admin/firm-profile
 * Update persisted company overview and founder profile
 */
router.patch("/", validateFirmProfileUpdate, updateFirmProfileController);

export default router;
