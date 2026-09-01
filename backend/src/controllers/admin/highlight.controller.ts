/*
 * PURPOSE:
 * Admin project highlight HTTP controller.
 *
 * FLOW:
 * Admin Project Highlight Management Flow
 *
 * RESPONSIBILITY:
 * Maps authenticated HTTP requests to the project service's highlight CRUD operations.
 */

import type { NextFunction, Request, Response } from "express";
import {
  createProjectHighlight,
  deleteProjectHighlight,
  listProjectHighlights,
  updateProjectHighlight,
} from "../../services/project.service.js";

type ProjectHighlightParams = { projectId: string; highlightId?: string };

export async function listProjectHighlightsController(
  req: Request<ProjectHighlightParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await listProjectHighlights(req.params.projectId));
  } catch (error) {
    next(error);
  }
}

export async function createProjectHighlightController(
  req: Request<ProjectHighlightParams, unknown, { text: string; sortOrder?: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(201).json(await createProjectHighlight(req.params.projectId, req.body));
  } catch (error) {
    next(error);
  }
}

export async function updateProjectHighlightController(
  req: Request<ProjectHighlightParams, unknown, { text?: string; sortOrder?: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await updateProjectHighlight(
        req.params.projectId,
        req.params.highlightId as string,
        req.body,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteProjectHighlightController(
  req: Request<ProjectHighlightParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await deleteProjectHighlight(
        req.params.projectId,
        req.params.highlightId as string,
      ),
    );
  } catch (error) {
    next(error);
  }
}
