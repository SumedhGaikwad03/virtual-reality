import type { LeadStatus } from "../../generated/prisma/enums.js";
import { configurationRepository } from "../repositories/configuration.repository.js";
import { leadRepository } from "../repositories/lead.repository.js";
import { projectRepository } from "../repositories/project.repository.js";

export type CreateLeadInput = {
  name: string;
  phone: string;
  email?: string;
  projectId?: string;
  configurationId?: string;
  message?: string;
};

export type UpdateLeadInput = { status?: LeadStatus; notes?: string | null };

export class LeadServiceError extends Error {
  constructor(
    public readonly code:
      | "PROJECT_NOT_FOUND"
      | "CONFIGURATION_NOT_FOUND"
      | "CONFIGURATION_PROJECT_MISMATCH"
      | "LEAD_NOT_FOUND",
    public readonly statusCode: 400 | 404,
    message: string,
  ) {
    super(message);
    this.name = "LeadServiceError";
  }
}

function toAdminLead(lead: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  project: { id: string; name: string; slug: string } | null;
  configuration: { id: string; name: string } | null;
  message: string | null;
  status: LeadStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    project: lead.project,
    configuration: lead.configuration,
    message: lead.message,
    status: lead.status,
    notes: lead.notes,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

async function validateContext(input: CreateLeadInput) {
  if (input.projectId && !(await projectRepository.findById(input.projectId))) {
    throw new LeadServiceError("PROJECT_NOT_FOUND", 404, "Project not found");
  }

  if (input.configurationId) {
    const configuration = await configurationRepository.findById(
      input.configurationId,
    );
    if (!configuration) {
      throw new LeadServiceError(
        "CONFIGURATION_NOT_FOUND",
        404,
        "Configuration not found",
      );
    }
    if (input.projectId && configuration.projectId !== input.projectId) {
      throw new LeadServiceError(
        "CONFIGURATION_PROJECT_MISMATCH",
        400,
        "Configuration does not belong to the specified project",
      );
    }
  }
}

export async function createLead(input: CreateLeadInput) {
  await validateContext(input);
  const lead = await leadRepository.create({ ...input, status: "NEW" });
  return {
    data: { id: lead.id, status: lead.status, createdAt: lead.createdAt },
  };
}

export async function listLeads() {
  const leads = await leadRepository.findMany();
  return { data: leads.map(toAdminLead) };
}

export async function getLeadById(id: string) {
  const lead = await leadRepository.findById(id);
  if (!lead) throw new LeadServiceError("LEAD_NOT_FOUND", 404, "Lead not found");
  return { data: toAdminLead(lead) };
}

export async function updateLead(id: string, input: UpdateLeadInput) {
  if (!(await leadRepository.findById(id))) {
    throw new LeadServiceError("LEAD_NOT_FOUND", 404, "Lead not found");
  }
  return { data: toAdminLead(await leadRepository.update(id, input)) };
}
