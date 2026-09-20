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
  createdById: true,
  ownerId: true,
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  owner: { select: { id: true, name: true, email: true, role: true } },
  developer: { select: { id: true, name: true, slug: true } },
  project: { select: { id: true, name: true, slug: true } },
  configuration: { select: { id: true, name: true } },
  message: true,
  visitDate: true,
  visitTime: true,
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
  ownerId?: string;
  createdById?: string;
};

export type LeadUpdateData = {
  name?: string;
  phone?: string;
  email?: string | null;
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
  message?: string | null;
  visitDate?: string | null;
  visitTime?: string | null;
  status?: LeadStatus;
  notes?: string | null;
  ownerId?: string | null;
};

export class LeadRepository {
  create(data: {
    name: string;
    phone: string;
    email?: string;
    developerId?: string;
    projectId?: string;
    configurationId?: string;
    createdById?: string | null;
    ownerId?: string | null;
    message?: string;
    visitDate?: string;
    visitTime?: string;
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
    if (options?.ownerId) {
      where.ownerId = options.ownerId;
    }
    if (options?.createdById) {
      where.createdById = options.createdById;
    }

    if (options?.search && options.search.trim() !== "") {
      const tokens = options.search.trim().split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => ({
          OR: [
            { name: { contains: token, mode: "insensitive" } },
            { phone: { contains: token, mode: "insensitive" } },
            { email: { contains: token, mode: "insensitive" } },
            { message: { contains: token, mode: "insensitive" } },
            { notes: { contains: token, mode: "insensitive" } },
            { developer: { name: { contains: token, mode: "insensitive" } } },
            { project: { name: { contains: token, mode: "insensitive" } } },
            { project: { locationName: { contains: token, mode: "insensitive" } } },
            { configuration: { name: { contains: token, mode: "insensitive" } } },
          ],
        }));
      }
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

  async findVisits(ownerId?: string) {
    const where: Record<string, unknown> = {
      visitDate: {
        not: null,
      },
    };
    if (ownerId) {
      where.ownerId = ownerId;
    }
    return prisma.lead.findMany({
      where,
      orderBy: [
        { visitDate: "asc" },
        { createdAt: "asc" },
      ],
      select: leadSelect,
    });
  }

  update(id: string, data: LeadUpdateData) {
    return prisma.lead.update({ where: { id }, data, select: leadSelect });
  }

  delete(id: string) {
    return prisma.lead.delete({ where: { id }, select: { id: true } });
  }
}

export const leadRepository = new LeadRepository();
