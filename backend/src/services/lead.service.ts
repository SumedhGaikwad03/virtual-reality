/*
 * PURPOSE:
 * Lead capture, validation, context resolution, and administrative lifecycle service.
 *
 * FLOW:
 * Public Lead Capture Flow & Admin Lead Triage Flow
 *
 * RESPONSIBILITY:
 * - Validates public lead submissions and enforces relational integrity.
 * - Auto-populates parent developerId and projectId context based on configuration/project relationships.
 * - Supports developer-level enquiries (where developerId is supplied directly).
 * - Prevents cross-developer / cross-project / cross-configuration ownership mismatches.
 * - Manages lead status transitions and administrative triage notes.
 */

import type { LeadStatus } from "../../generated/prisma/enums.js";
import { configurationRepository } from "../repositories/configuration.repository.js";
import { developerRepository } from "../repositories/developer.repository.js";
import { leadRepository } from "../repositories/lead.repository.js";
import { projectRepository } from "../repositories/project.repository.js";

export type CreateLeadInput = {
  name: string;
  phone: string;
  email?: string;
  developerId?: string;
  projectId?: string;
  configurationId?: string;
  message?: string;
};

export type UpdateLeadInput = { status?: LeadStatus; notes?: string | null };

export class LeadServiceError extends Error {
  constructor(
    public readonly code:
      | "DEVELOPER_NOT_FOUND"
      | "PROJECT_NOT_FOUND"
      | "CONFIGURATION_NOT_FOUND"
      | "CONFIGURATION_PROJECT_MISMATCH"
      | "DEVELOPER_PROJECT_MISMATCH"
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
  developer: { id: string; name: string; slug: string } | null;
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
    developer: lead.developer,
    project: lead.project,
    configuration: lead.configuration,
    message: lead.message,
    status: lead.status,
    notes: lead.notes,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

/*
 * Lead Context & Relationship Resolution:
 * WHAT: Resolves authoritative developerId and parent projectId from configuration/project relationships.
 * WHY:  Supports Developer enquiries (developerId only), Project enquiries (projectId only), and Configuration enquiries (configurationId).
 *       Prevents mismatched developer/project/configuration submissions.
 */
type ResolvedLeadContext = {
  developerId?: string;
  projectId?: string;
  configurationId?: string;
};

async function resolveLeadContext(
  input: CreateLeadInput,
): Promise<ResolvedLeadContext> {
  let resolvedDeveloperId = input.developerId;
  let resolvedProjectId = input.projectId;
  let resolvedConfigurationId = input.configurationId;

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

    // Authoritatively auto-populate the parent projectId from the verified Configuration
    resolvedProjectId = configuration.projectId;

    // Retrieve project to derive owning developerId
    const project = await projectRepository.findById(configuration.projectId);
    if (project) {
      if (input.developerId && project.developerId !== input.developerId) {
        throw new LeadServiceError(
          "DEVELOPER_PROJECT_MISMATCH",
          400,
          "Project does not belong to the specified developer",
        );
      }
      resolvedDeveloperId = project.developerId;
    }
  } else if (input.projectId) {
    const project = await projectRepository.findById(input.projectId);
    if (!project) {
      throw new LeadServiceError(
        "PROJECT_NOT_FOUND",
        404,
        "Project not found",
      );
    }

    if (input.developerId && project.developerId !== input.developerId) {
      throw new LeadServiceError(
        "DEVELOPER_PROJECT_MISMATCH",
        400,
        "Project does not belong to the specified developer",
      );
    }

    // Authoritatively auto-populate owning developerId from the verified Project
    resolvedDeveloperId = project.developerId;
  } else if (input.developerId) {
    const developer = await developerRepository.findById(input.developerId);
    if (!developer) {
      throw new LeadServiceError(
        "DEVELOPER_NOT_FOUND",
        404,
        "Developer not found",
      );
    }
  }

  return {
    developerId: resolvedDeveloperId,
    projectId: resolvedProjectId,
    configurationId: resolvedConfigurationId,
  };
}

export async function createLead(input: CreateLeadInput) {
  const context = await resolveLeadContext(input);

  const lead = await leadRepository.create({
    name: input.name,
    phone: input.phone,
    email: input.email,
    developerId: context.developerId,
    projectId: context.projectId,
    configurationId: context.configurationId,
    message: input.message,
    status: "NEW",
  });

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
