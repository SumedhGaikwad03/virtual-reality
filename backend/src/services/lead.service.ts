/*
 * PURPOSE:
 * Lead capture, validation, context resolution, and administrative lifecycle service.
 *
 * FLOW:
 * Public Lead Capture Flow & Admin Lead Triage/CRUD Flow
 *
 * RESPONSIBILITY:
 * - Validates public lead submissions and enforces relational integrity.
 * - Auto-populates parent developerId and projectId context based on configuration/project relationships.
 * - Supports developer-level enquiries (where developerId is supplied directly).
 * - Prevents cross-developer / cross-project / cross-configuration ownership mismatches.
 * - Manages lead creation (public & admin), full updates, deletion, search, filtering, and pagination.
 */

import type { LeadStatus } from "../../generated/prisma/enums.js";
import { configurationRepository } from "../repositories/configuration.repository.js";
import { developerRepository } from "../repositories/developer.repository.js";
import { leadRepository, type LeadFindManyOptions, type LeadUpdateData } from "../repositories/lead.repository.js";
import { projectRepository } from "../repositories/project.repository.js";
import { notifyNewLead } from "./notification.service.js";
import { normalizeIndianPhone } from "../validators/lead.validator.js";

export type CreateLeadInput = {
  name: string;
  phone: string;
  email?: string;
  developerId?: string;
  projectId?: string;
  configurationId?: string;
  message?: string;
};

export type CreateAdminLeadInput = {
  name: string;
  phone: string;
  email?: string | null;
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
  message?: string | null;
  status?: LeadStatus;
  notes?: string | null;
};

export type UpdateAdminLeadInput = {
  name?: string;
  phone?: string;
  email?: string | null;
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
  message?: string | null;
  status?: LeadStatus;
  notes?: string | null;
};

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

async function resolveLeadContext(input: {
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
}): Promise<ResolvedLeadContext> {
  let resolvedDeveloperId = input.developerId || undefined;
  let resolvedProjectId = input.projectId || undefined;
  let resolvedConfigurationId = input.configurationId || undefined;

  if (resolvedConfigurationId) {
    const configuration = await configurationRepository.findById(
      resolvedConfigurationId,
    );
    if (!configuration) {
      throw new LeadServiceError(
        "CONFIGURATION_NOT_FOUND",
        404,
        "Configuration not found",
      );
    }

    if (resolvedProjectId && configuration.projectId !== resolvedProjectId) {
      throw new LeadServiceError(
        "CONFIGURATION_PROJECT_MISMATCH",
        400,
        "Configuration does not belong to the specified project",
      );
    }

    // Authoritatively auto-populate parent projectId from verified Configuration
    resolvedProjectId = configuration.projectId;

    // Retrieve project to derive owning developerId
    const project = await projectRepository.findById(configuration.projectId);
    if (project) {
      if (resolvedDeveloperId && project.developerId !== resolvedDeveloperId) {
        throw new LeadServiceError(
          "DEVELOPER_PROJECT_MISMATCH",
          400,
          "Project does not belong to the specified developer",
        );
      }
      resolvedDeveloperId = project.developerId;
    }
  } else if (resolvedProjectId) {
    const project = await projectRepository.findById(resolvedProjectId);
    if (!project) {
      throw new LeadServiceError(
        "PROJECT_NOT_FOUND",
        404,
        "Project not found",
      );
    }

    if (resolvedDeveloperId && project.developerId !== resolvedDeveloperId) {
      throw new LeadServiceError(
        "DEVELOPER_PROJECT_MISMATCH",
        400,
        "Project does not belong to the specified developer",
      );
    }

    // Authoritatively auto-populate owning developerId from verified Project
    resolvedDeveloperId = project.developerId;
  } else if (resolvedDeveloperId) {
    const developer = await developerRepository.findById(resolvedDeveloperId);
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
    phone: normalizeIndianPhone(input.phone) || input.phone,
    email: input.email,
    developerId: context.developerId,
    projectId: context.projectId,
    configurationId: context.configurationId,
    message: input.message,
    status: "NEW",
  });

  // Lead persistence is authoritative; notification failure must never reject a successful lead.
  void notifyNewLead({
    id: lead.id,
    projectName: lead.project?.name,
    configurationName: lead.configuration?.name,
  }).catch(() => undefined);

  return {
    data: { id: lead.id, status: lead.status, createdAt: lead.createdAt },
  };
}

export async function createAdminLead(input: CreateAdminLeadInput) {
  const context = await resolveLeadContext({
    developerId: input.developerId,
    projectId: input.projectId,
    configurationId: input.configurationId,
  });

  const lead = await leadRepository.create({
    name: input.name,
    phone: normalizeIndianPhone(input.phone) || input.phone,
    email: input.email || undefined,
    developerId: context.developerId,
    projectId: context.projectId,
    configurationId: context.configurationId,
    message: input.message || undefined,
    status: input.status || "NEW",
    notes: input.notes || undefined,
  });

  return {
    data: toAdminLead(lead),
  };
}

export async function listLeads(options?: LeadFindManyOptions) {
  const result = await leadRepository.findMany(options);
  return {
    data: result.leads.map(toAdminLead),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
}

export async function getLeadById(id: string) {
  const lead = await leadRepository.findById(id);
  if (!lead) throw new LeadServiceError("LEAD_NOT_FOUND", 404, "Lead not found");
  return { data: toAdminLead(lead) };
}

export async function updateLead(id: string, input: UpdateAdminLeadInput) {
  const existing = await leadRepository.findById(id);
  if (!existing) {
    throw new LeadServiceError("LEAD_NOT_FOUND", 404, "Lead not found");
  }

  const updateData: LeadUpdateData = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.message !== undefined) updateData.message = input.message;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.notes !== undefined) updateData.notes = input.notes;

  // If any relationship is explicitly provided or modified, resolve it
  const hasRelationshipChange =
    input.developerId !== undefined ||
    input.projectId !== undefined ||
    input.configurationId !== undefined;

  if (hasRelationshipChange) {
    const targetDeveloperId = input.developerId !== undefined ? input.developerId : existing.developerId;
    const targetProjectId = input.projectId !== undefined ? input.projectId : existing.projectId;
    const targetConfigurationId = input.configurationId !== undefined ? input.configurationId : existing.configurationId;

    const resolved = await resolveLeadContext({
      developerId: targetDeveloperId,
      projectId: targetProjectId,
      configurationId: targetConfigurationId,
    });

    updateData.developerId = resolved.developerId ?? null;
    updateData.projectId = resolved.projectId ?? null;
    updateData.configurationId = resolved.configurationId ?? null;
  }

  const updated = await leadRepository.update(id, updateData);
  return { data: toAdminLead(updated) };
}

export async function deleteLead(id: string) {
  const existing = await leadRepository.findById(id);
  if (!existing) {
    throw new LeadServiceError("LEAD_NOT_FOUND", 404, "Lead not found");
  }

  await leadRepository.delete(id);
  return { data: { deleted: true, id } };
}
