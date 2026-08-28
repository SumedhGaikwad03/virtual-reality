/*
 * PURPOSE:
 * Admin configuration route definitions.
 *
 * FLOW:
 * Admin Configuration Management Flow
 *
 * RESPONSIBILITY:
 * Mounts authenticated admin endpoints for configurations:
 * - projectRouter (/api/admin/projects/:projectId/configurations): list and create configurations under a project.
 * - configurationRouter (/api/admin/configurations/:id): get and update a single configuration by ID.
 */

import express, { Router } from "express";
import {
  createConfigurationController,
  getConfigurationController,
  listProjectConfigurationsController,
  updateConfigurationController,
} from "../../controllers/admin/configuration.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import {
  validateAdminCreateConfiguration,
  validateAdminUpdateConfiguration,
  validateConfigurationId,
  validateConfigurationProjectId,
} from "../../validators/configuration.validator.js";

const projectRouter = Router({ mergeParams: true });
projectRouter.use(requireAdminAuthentication);
projectRouter.use(express.json());
projectRouter.post(
  "/",
  validateConfigurationProjectId,
  validateAdminCreateConfiguration,
  createConfigurationController,
);
projectRouter.get(
  "/",
  validateConfigurationProjectId,
  listProjectConfigurationsController,
);

const configurationRouter = Router();
configurationRouter.use(requireAdminAuthentication);
configurationRouter.use(express.json());
configurationRouter.get(
  "/:id",
  validateConfigurationId,
  getConfigurationController,
);
configurationRouter.patch(
  "/:id",
  validateConfigurationId,
  validateAdminUpdateConfiguration,
  updateConfigurationController,
);

export { projectRouter, configurationRouter };
