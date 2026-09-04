/*
 * PURPOSE:
 * Lead data access repository.
 *
 * FLOW:
 * Lead Capture and Admin Lead Management Flow
 *
 * RESPONSIBILITY:
 * Executes Prisma queries for Lead persistence: create, findMany (with search/filters/pagination), findById, update, and delete.
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

export type LeadFindManyOptions = {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  developerId?: string;
  projectId?: string;
  configurationId?: string;
};

export type LeadUpdateData = {
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
    notes?: string;
  }) {
    return prisma.lead.create({ data, select: leadSelect });
  }

  async findMany(options?: LeadFindManyOptions) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options?.status) {
      where.status = options.status;
    }
    if (options?.developerId) {
      where.developerId = options.developerId;
    }
    if (options?.projectId) {
      where.projectId = options.projectId;
    }
    if (options?.configurationId) {
      where.configurationId = options.configurationId;
    }

    if (options?.search && options.search.trim() !== "") {
      const searchTerm = options.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { message: { contains: searchTerm, mode: "insensitive" } },
        { notes: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const [total, leads] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
        select: leadSelect,
      }),
    ]);

    return {
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  findById(id: string) {
    return prisma.lead.findUnique({ where: { id }, select: leadSelect });
  }

  update(id: string, data: LeadUpdateData) {
    return prisma.lead.update({ where: { id }, data, select: leadSelect });
  }

  delete(id: string) {
    return prisma.lead.delete({ where: { id }, select: { id: true } });
  }
}

export const leadRepository = new LeadRepository();
