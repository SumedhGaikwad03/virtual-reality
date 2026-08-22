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
