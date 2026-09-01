/*
 * PURPOSE:
 * Admin project amenity route definitions.
 *
 * FLOW:
 * Admin Project Amenity Management Flow
 *
 * RESPONSIBILITY:
 * Mounts authenticated admin endpoints for project amenities:
 * - projectAmenityRouter (/api/admin/projects/:projectId/amenities): list, create, update, delete project amenities.
 */

import express, { Router } from "express";
import {
  createProjectAmenityController,
  deleteProjectAmenityController,
  listProjectAmenitiesController,
  updateProjectAmenityController,
} from "../../controllers/admin/amenity.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";

const projectAmenityRouter = Router({ mergeParams: true });

projectAmenityRouter.use(requireAdminAuthentication);
projectAmenityRouter.use(express.json());

projectAmenityRouter.get("/", listProjectAmenitiesController);
projectAmenityRouter.post("/", createProjectAmenityController);
projectAmenityRouter.patch("/:amenityId", updateProjectAmenityController);
projectAmenityRouter.delete("/:amenityId", deleteProjectAmenityController);

export { projectAmenityRouter };
