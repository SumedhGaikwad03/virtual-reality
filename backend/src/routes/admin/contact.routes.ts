/*
 * PURPOSE:
 * Admin contact route definitions.
 *
 * FLOW:
 * Admin HTTP Request -> contact.routes -> contact.controller -> contact.repository.
 *
 * RESPONSIBILITY:
 * Mounts authenticated admin endpoints for reading and updating firm contact information.
 */

import express, { Router } from "express";
import {
  getContactController,
  updateContactController,
} from "../../controllers/admin/contact.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import { validateContactUpdate } from "../../validators/contact.validator.js";

const router = Router();

router.use(requireAdminAuthentication);
router.use(express.json());

/*
 * GET /api/admin/contact
 * Retrieve current persisted firm contact configuration
 */
router.get("/", getContactController);

/*
 * PATCH /api/admin/contact
 * Update persisted firm contact configuration
 */
router.patch("/", validateContactUpdate, updateContactController);

export default router;
