/*
 * PURPOSE:
 * Admin lead management HTTP controllers.
 *
 * FLOW:
 * Admin Lead Management Flow
 *
 * RESPONSIBILITY:
 * Handles listing (with search/filters/pagination), manual creation, retrieval, full updates, and deletion of lead records.
 */

import type { NextFunction, Request, Response } from "express";
import type { LeadStatus } from "../../../generated/prisma/enums.js";
import {
  createAdminLead,
  deleteLead,
  getLeadById,
  listLeads,
  updateLead,
  type CreateAdminLeadInput,
  type UpdateAdminLeadInput,
} from "../../services/lead.service.js";
import type {
  AdminLeadCreateBody,
  AdminLeadUpdateBody,
} from "../../validators/lead.validator.js";

type LeadIdParams = { id: string };

export async function createAdminLeadController(
  req: Request<{}, unknown, AdminLeadCreateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const result = await createAdminLead({
      name: body.name as string,
      phone: body.phone as string,
      email: body.email as string | undefined,
      developerId: body.developerId as string | undefined,
      projectId: body.projectId as string | undefined,
      configurationId: body.configurationId as string | undefined,
      message: body.message as string | undefined,
      status: body.status as LeadStatus | undefined,
      notes: body.notes as string | undefined,
    } satisfies CreateAdminLeadInput);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listLeadsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit, search, status, developerId, projectId, configurationId } = req.query;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: typeof search === "string" ? search : undefined,
      status: typeof status === "string" ? (status as LeadStatus) : undefined,
      developerId: typeof developerId === "string" ? developerId : undefined,
      projectId: typeof projectId === "string" ? projectId : undefined,
      configurationId: typeof configurationId === "string" ? configurationId : undefined,
    };

    res.status(200).json(await listLeads(options));
  } catch (error) {
    next(error);
  }
}

export async function getLeadController(
  req: Request<LeadIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getLeadById(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function updateLeadController(
  req: Request<LeadIdParams, unknown, AdminLeadUpdateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const input: UpdateAdminLeadInput = {
      name: body.name as string | undefined,
      phone: body.phone as string | undefined,
      email: body.email as string | null | undefined,
      developerId: body.developerId as string | null | undefined,
      projectId: body.projectId as string | null | undefined,
      configurationId: body.configurationId as string | null | undefined,
      message: body.message as string | null | undefined,
      status: body.status as LeadStatus | undefined,
      notes: body.notes as string | null | undefined,
    };

    res.status(200).json(await updateLead(req.params.id, input));
  } catch (error) {
    next(error);
  }
}

export async function deleteLeadController(
  req: Request<LeadIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await deleteLead(req.params.id));
  } catch (error) {
    next(error);
  }
}
