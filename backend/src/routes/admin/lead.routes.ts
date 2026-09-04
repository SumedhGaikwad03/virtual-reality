/*
 * PURPOSE:
 * Admin lead management route definitions and authentication middleware mounting.
 *
 * FLOW:
 * Admin Lead Management Flow
 *
 * RESPONSIBILITY:
 * Mounts GET /api/admin/leads, POST /api/admin/leads, GET /api/admin/leads/:id,
 * PATCH /api/admin/leads/:id, and DELETE /api/admin/leads/:id with admin auth and validation.
 */

import express, { Router } from "express";
import {
  createAdminLeadController,
  deleteLeadController,
  getLeadController,
  listLeadsController,
  updateLeadController,
} from "../../controllers/admin/lead.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import {
  validateAdminLeadUpdate,
  validateCreateAdminLead,
  validateLeadId,
  validateListLeadsQuery,
} from "../../validators/lead.validator.js";

const router = Router();
router.use(express.json());

router.get(
  "/",
  requireAdminAuthentication,
  validateListLeadsQuery,
  listLeadsController,
);

router.post(
  "/",
  requireAdminAuthentication,
  validateCreateAdminLead,
  createAdminLeadController,
);

router.get(
  "/:id",
  requireAdminAuthentication,
  validateLeadId,
  getLeadController,
);

router.patch(
  "/:id",
  requireAdminAuthentication,
  validateLeadId,
  validateAdminLeadUpdate,
  updateLeadController,
);

router.delete(
  "/:id",
  requireAdminAuthentication,
  validateLeadId,
  deleteLeadController,
);

export default router;
