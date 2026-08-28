/*
 * PURPOSE:
 * Admin lead management route definitions and authentication middleware mounting.
 *
 * FLOW:
 * Admin Lead Triage Flow
 *
 * RESPONSIBILITY:
 * Mounts GET /api/admin/leads, GET /api/admin/leads/:id, and PATCH /api/admin/leads/:id with admin auth and validation.
 */

import express, { Router } from "express";
import {
  getLeadController,
  listLeadsController,
  updateLeadController,
} from "../../controllers/admin/lead.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import {
  validateAdminLeadUpdate,
  validateLeadId,
} from "../../validators/lead.validator.js";


const router = Router();
router.use(express.json());
router.get("/", requireAdminAuthentication, listLeadsController);
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

export default router;
