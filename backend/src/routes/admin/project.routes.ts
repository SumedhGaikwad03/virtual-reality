/*
 * PURPOSE:
 * Admin project route definitions.
 *
 * FLOW:
 * Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Mounts authenticated admin CRUD endpoints for projects (/api/admin/projects) and connects validation to controllers.
 */

import express, { Router } from "express";
import {
  createProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
} from "../../controllers/admin/project.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import {
  validateAdminCreateProject,
  validateAdminProjectId,
  validateAdminUpdateProject,
} from "../../validators/project.validator.js";

const router = Router();

router.use(requireAdminAuthentication);
router.use(express.json());

router.post("/", validateAdminCreateProject, createProjectController);
router.get("/", listProjectsController);
router.get("/:id", validateAdminProjectId, getProjectController);
router.patch(
  "/:id",
  validateAdminProjectId,
  validateAdminUpdateProject,
  updateProjectController,
);

export default router;
