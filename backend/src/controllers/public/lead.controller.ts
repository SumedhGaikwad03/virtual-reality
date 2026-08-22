import type { NextFunction, Request, Response } from "express";
import { createLead, type CreateLeadInput } from "../../services/lead.service.js";
import type { PublicLeadBody } from "../../validators/lead.validator.js";

export async function createLeadController(
  req: Request<{}, unknown, PublicLeadBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    res.status(201).json(
      await createLead({
        name: body.name as string,
        phone: body.phone as string,
        email: body.email as string | undefined,
        projectId: body.projectId as string | undefined,
        configurationId: body.configurationId as string | undefined,
        message: body.message as string | undefined,
      } satisfies CreateLeadInput),
    );
  } catch (error) {
    next(error);
  }
}
