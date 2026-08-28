/*
 * PURPOSE:
 * Public project route definitions.
 *
 * FLOW:
 * Public Project Discovery Flow
 *
 * RESPONSIBILITY:
 * Mounts GET /:developerSlug/:locationSlug/:projectSlug and connects parameter validation to controller.
 */

import { Router } from "express";
import { getPublicProjectController } from "../../controllers/public/project.controller.js";
import { validateProjectParams } from "../../validators/project.validator.js";

const router = Router();

router.get(
  "/:developerSlug/:locationSlug/:projectSlug",
  validateProjectParams,
  getPublicProjectController,
);

export default router;
