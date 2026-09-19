/*
 * PURPOSE:
 * Admin scheduled property visits route definitions.
 *
 * FLOW:
 * Admin Visits Workspace Flow
 *
 * RESPONSIBILITY:
 * Mounts GET /api/admin/visits with admin authentication.
 */

import express, { Router } from "express";
import {
  createVisitController,
  deleteVisitController,
  getVisitController,
  getVisitsController,
  updateVisitController,
} from "../../controllers/admin/lead.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import {
  validateAdminLeadUpdate,
  validateCreateAdminVisit,
  validateLeadId,
} from "../../validators/lead.validator.js";

const router = Router();
router.use(express.json());

router.get("/", requireAdminAuthentication, getVisitsController);
router.post(
  "/",
  requireAdminAuthentication,
  validateCreateAdminVisit,
  createVisitController,
);
router.get(
  "/:id",
  requireAdminAuthentication,
  validateLeadId,
  getVisitController,
);
router.patch(
  "/:id",
  requireAdminAuthentication,
  validateLeadId,
  validateAdminLeadUpdate,
  updateVisitController,
);
router.delete(
  "/:id",
  requireAdminAuthentication,
  validateLeadId,
  deleteVisitController,
);

export default router;
