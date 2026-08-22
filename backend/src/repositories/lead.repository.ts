import { prisma } from "../lib/prisma.js";
import type { LeadStatus } from "../../generated/prisma/enums.js";

const leadSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  projectId: true,
  configurationId: true,
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
