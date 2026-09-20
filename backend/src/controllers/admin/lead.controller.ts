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
import type { AuthenticatedAdmin } from "../../middleware/auth.middleware.js";
import {
  createAdminLead,
  deleteLead,
  getLeadById,
  getVisits,
  listLeads,
  reassignLeadOwner,
  updateLead,
  type CreateAdminLeadInput,
  type UpdateAdminLeadInput,
} from "../../services/lead.service.js";
import type {
  AdminLeadCreateBody,
  AdminLeadUpdateBody,
  ReassignLeadOwnerBody,
} from "../../validators/lead.validator.js";

type LeadIdParams = { id: string };

export async function createAdminLeadController(
  req: Request<{}, unknown, AdminLeadCreateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    const body = req.body;
    const result = await createAdminLead({
      name: body.name as string,
      phone: body.phone as string,
      email: body.email as string | undefined,
      developerId: body.developerId as string | undefined,
      projectId: body.projectId as string | undefined,
      configurationId: body.configurationId as string | undefined,
      message: body.message as string | undefined,
      visitDate: body.visitDate as string | null | undefined,
      visitTime: body.visitTime as string | null | undefined,
      status: body.status as LeadStatus | undefined,
      notes: body.notes as string | undefined,
    } satisfies CreateAdminLeadInput, actorAdmin);

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
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    const {
      page,
      limit,
      search,
      status,
      type,
      developerId,
      projectId,
      configurationId,
      ownerId,
      createdById,
    } = req.query;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: typeof search === "string" ? search : undefined,
      status: typeof status === "string" ? (status as any) : undefined,
      type: typeof type === "string" ? (type.toUpperCase() as "ALL" | "PROPERTY" | "RENTAL") : undefined,
      developerId: typeof developerId === "string" ? developerId : undefined,
      projectId: typeof projectId === "string" ? projectId : undefined,
      configurationId: typeof configurationId === "string" ? configurationId : undefined,
      ownerId: typeof ownerId === "string" ? ownerId : undefined,
      createdById: typeof createdById === "string" ? createdById : undefined,
    };

    res.status(200).json(await listLeads(options, actorAdmin));
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
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    res.status(200).json(await getLeadById(req.params.id, actorAdmin));
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
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    const body = req.body;
    const input: UpdateAdminLeadInput = {
      name: body.name as string | undefined,
      phone: body.phone as string | undefined,
      email: body.email as string | null | undefined,
      developerId: body.developerId as string | null | undefined,
      projectId: body.projectId as string | null | undefined,
      configurationId: body.configurationId as string | null | undefined,
      message: body.message as string | null | undefined,
      visitDate: body.visitDate as string | null | undefined,
      visitTime: body.visitTime as string | null | undefined,
      status: body.status as LeadStatus | undefined,
      notes: body.notes as string | null | undefined,
    };

    res.status(200).json(await updateLead(req.params.id, input, actorAdmin));
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
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    res.status(200).json(await deleteLead(req.params.id, actorAdmin));
  } catch (error) {
    next(error);
  }
}

export async function reassignLeadOwnerController(
  req: Request<LeadIdParams, unknown, ReassignLeadOwnerBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdmin = res.locals.admin as AuthenticatedAdmin;
    const ownerId = req.body.ownerId as string;
    res.status(200).json(await reassignLeadOwner(req.params.id, ownerId, actorAdmin));
  } catch (error) {
    next(error);
  }
}

export async function getVisitsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    const result = await getVisits(actorAdmin);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function createVisitController(
  req: Request<{}, unknown, AdminLeadCreateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    const body = req.body;
    const result = await createAdminLead({
      name: body.name as string,
      phone: body.phone as string,
      email: body.email as string | undefined,
      developerId: body.developerId as string | undefined,
      projectId: body.projectId as string | undefined,
      configurationId: body.configurationId as string | undefined,
      message: body.message as string | undefined,
      visitDate: body.visitDate as string,
      visitTime: body.visitTime as string | null | undefined,
      status: body.status as LeadStatus | undefined,
      notes: body.notes as string | undefined,
    } satisfies CreateAdminLeadInput, actorAdmin);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getVisitController(
  req: Request<LeadIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    res.status(200).json(await getLeadById(req.params.id, actorAdmin));
  } catch (error) {
    next(error);
  }
}

export async function updateVisitController(
  req: Request<LeadIdParams, unknown, AdminLeadUpdateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    const body = req.body;
    const input: UpdateAdminLeadInput = {
      name: body.name as string | undefined,
      phone: body.phone as string | undefined,
      email: body.email as string | null | undefined,
      developerId: body.developerId as string | null | undefined,
      projectId: body.projectId as string | null | undefined,
      configurationId: body.configurationId as string | null | undefined,
      message: body.message as string | null | undefined,
      visitDate: body.visitDate as string | null | undefined,
      visitTime: body.visitTime as string | null | undefined,
      status: body.status as LeadStatus | undefined,
      notes: body.notes as string | null | undefined,
    };

    res.status(200).json(await updateLead(req.params.id, input, actorAdmin));
  } catch (error) {
    next(error);
  }
}

export async function deleteVisitController(
  req: Request<LeadIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdmin = res.locals.admin as AuthenticatedAdmin | undefined;
    res.status(200).json(await deleteLead(req.params.id, actorAdmin));
  } catch (error) {
    next(error);
  }
}
