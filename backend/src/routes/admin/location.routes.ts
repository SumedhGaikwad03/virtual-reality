/*
 * PURPOSE:
 * Admin location snapshot route definitions.
 *
 * FLOW:
 * - POST /api/admin/location: Authenticated Admin -> validateLocationUpdate -> updateLocationController.
 * - GET /api/admin/locations: Founder Admin -> getLocationsController.
 *
 * RESPONSIBILITY:
 * - Mounts POST /api/admin/location for employee/founder location snapshot updates.
 * - Mounts GET /api/admin/locations for Founder-only multi-admin location retrieval.
 */

import express, { Router } from "express";
import {
  updateLocationController,
  getLocationsController,
} from "../../controllers/admin/location.controller.js";
import {
  requireAdminAuthentication,
  requireFounderAuthentication,
} from "../../middleware/auth.middleware.js";
import { validateLocationUpdate } from "../../validators/location.validator.js";

export const locationRouter = Router();
locationRouter.use(express.json());
locationRouter.post(
  "/",
  requireAdminAuthentication,
  validateLocationUpdate,
  updateLocationController,
);

export const locationsRouter = Router();
locationsRouter.get(
  "/",
  requireFounderAuthentication,
  getLocationsController,
);
