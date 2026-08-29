/*
 * PURPOSE:
 * Lead data access repository.
 *
 * FLOW:
 * Lead Capture and Admin Lead Management Flow
 *
 * RESPONSIBILITY:
 * Executes Prisma queries for Lead persistence: create, findMany (bounded), findById, and update.
 */

import { prisma } from "../lib/prisma.js";
import type { LeadStatus } from "../../generated/prisma/enums.js";

const leadSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  developerId: true,
  projectId: true,
  configurationId: true,
  developer: { select: { id: true, name: true, slug: true } },
  project: { select: { id: true, name: true, slug: true } },
  configuration: { select: { id: true, name: true } },
  message: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class LeadRepository {
  create(data: {
    name: string;
    phone: string;
    email?: string;
    developerId?: string;
    projectId?: string;
    configurationId?: string;
    message?: string;
    status: LeadStatus;
  }) {
    return prisma.lead.create({ data, select: leadSelect });
  }

  findMany() {
    return prisma.lead.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      // Bounded administrative lead limit: Returns the 100 most recent leads to prevent unbounded table reads
      take: 100,
      select: leadSelect,
    });
  }

  findById(id: string) {
    return prisma.lead.findUnique({ where: { id }, select: leadSelect });
  }

  update(id: string, data: { status?: LeadStatus; notes?: string | null }) {
    return prisma.lead.update({ where: { id }, data, select: leadSelect });
  }
}

export const leadRepository = new LeadRepository();

