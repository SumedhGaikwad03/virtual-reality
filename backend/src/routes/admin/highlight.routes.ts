/*
 * PURPOSE:
 * Admin project highlight route definitions.
 *
 * FLOW:
 * Authenticated request -> highlight route -> highlight controller -> project service.
 *
 * RESPONSIBILITY:
 * Mounts list, create, update, and delete endpoints for project-owned highlights.
 */

import express, { Router } from "express";
import {
  createProjectHighlightController,
  deleteProjectHighlightController,
  listProjectHighlightsController,
  updateProjectHighlightController,
} from "../../controllers/admin/highlight.controller.js";
import { requireFounderAuthentication } from "../../middleware/auth.middleware.js";

const projectHighlightRouter = Router({ mergeParams: true });

projectHighlightRouter.use(requireFounderAuthentication);
projectHighlightRouter.use(express.json());

projectHighlightRouter.get("/", listProjectHighlightsController);
projectHighlightRouter.post("/", createProjectHighlightController);
projectHighlightRouter.patch("/:highlightId", updateProjectHighlightController);
projectHighlightRouter.delete("/:highlightId", deleteProjectHighlightController);

export { projectHighlightRouter };
