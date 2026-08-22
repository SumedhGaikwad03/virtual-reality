import type { NextFunction, Request, Response } from "express";
import {
  createProject,
  getProjectById,
  listProjects,
  updateProject,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "../../services/project.service.js";
import type {
  AdminCreateProjectBody,
  AdminUpdateProjectBody,
} from "../../validators/project.validator.js";
import type { ProjectStatus } from "../../../generated/prisma/enums.js";

type ProjectIdParams = { id: string };

export async function createProjectController(
  req: Request<{}, unknown, AdminCreateProjectBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const response = await createProject({
      developerId: body.developerId as string,
      name: body.name as string,
      slug: body.slug as string,
      description: body.description as string | undefined,
      locationName: body.locationName as string,
      locationSlug: body.locationSlug as string,
      address: body.address as string,
      mapsUrl: body.mapsUrl as string | undefined,
      status: body.status as ProjectStatus,
      featured: body.featured as boolean | undefined,
    } satisfies CreateProjectInput);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function listProjectsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await listProjects());
  } catch (error) {
    next(error);
  }
}

export async function getProjectController(
  req: Request<ProjectIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getProjectById(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function updateProjectController(
  req: Request<ProjectIdParams, unknown, AdminUpdateProjectBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await updateProject(req.params.id, req.body as UpdateProjectInput),
    );
  } catch (error) {
    next(error);
  }
}
