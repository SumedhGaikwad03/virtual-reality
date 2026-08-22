import type { NextFunction, Request, Response } from "express";
import {
  createDeveloper,
  getDeveloperById,
  listDevelopers,
  updateDeveloper,
  type CreateDeveloperInput,
  type UpdateDeveloperInput,
} from "../../services/developer.service.js";
import type {
  AdminCreateDeveloperBody,
  AdminUpdateDeveloperBody,
} from "../../validators/developer.validator.js";

type DeveloperIdParams = { id: string };

export async function createDeveloperController(
  req: Request<{}, unknown, AdminCreateDeveloperBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const response = await createDeveloper({
      name: body.name as string,
      slug: body.slug as string,
      description: body.description as string | undefined,
      logoUrl: body.logoUrl as string | undefined,
      websiteUrl: body.websiteUrl as string | undefined,
    } satisfies CreateDeveloperInput);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function listDevelopersController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await listDevelopers());
  } catch (error) {
    next(error);
  }
}

export async function getDeveloperController(
  req: Request<DeveloperIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getDeveloperById(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function updateDeveloperController(
  req: Request<DeveloperIdParams, unknown, AdminUpdateDeveloperBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body as UpdateDeveloperInput;
    res.status(200).json(await updateDeveloper(req.params.id, body));
  } catch (error) {
    next(error);
  }
}
