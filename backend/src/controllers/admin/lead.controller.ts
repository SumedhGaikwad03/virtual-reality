import type { NextFunction, Request, Response } from "express";
import {
  getLeadById,
  listLeads,
  updateLead,
  type UpdateLeadInput,
} from "../../services/lead.service.js";
import type { AdminLeadUpdateBody } from "../../validators/lead.validator.js";

type LeadIdParams = { id: string };

export async function listLeadsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try { res.status(200).json(await listLeads()); } catch (error) { next(error); }
}

export async function getLeadController(
  req: Request<LeadIdParams>,
  res: Response,
  next: NextFunction,
) {
  try { res.status(200).json(await getLeadById(req.params.id)); } catch (error) { next(error); }
}

export async function updateLeadController(
  req: Request<LeadIdParams, unknown, AdminLeadUpdateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await updateLead(req.params.id, req.body as UpdateLeadInput));
  } catch (error) { next(error); }
}
