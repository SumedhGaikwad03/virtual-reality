import type { NextFunction, Request, Response } from "express";
import { getPublicProject } from "../../services/project.service.js";

type ProjectRouteParams = {
  developerSlug: string;
  locationSlug: string;
  projectSlug: string;
};

export async function getPublicProjectController(
  req: Request<ProjectRouteParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { developerSlug, locationSlug, projectSlug } = req.params;
    const response = await getPublicProject(
      developerSlug,
      locationSlug,
      projectSlug,
    );

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
