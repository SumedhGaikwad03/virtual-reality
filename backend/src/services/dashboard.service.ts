/*
 * PURPOSE:
 * Admin dashboard aggregation service providing role-tailored operational data.
 *
 * FLOW:
 * Admin Dashboard API -> dashboard.service.ts -> Prisma Queries -> Role-scoped DTO.
 *
 * RESPONSIBILITY:
 * - FOUNDER: Returns organization-wide KPIs, full pipeline breakdown, all today's visits,
 *   all recent leads, active projects count, and shared rental statistics.
 * - EMPLOYEE: Returns personal workload KPIs (My Leads, New Leads, My Visits, In Progress),
 *   owned lead pipeline breakdown, today's visits for owned leads, owned recent leads,
 *   and identical shared rental statistics.
 * - Enforces server-side scoping so Employee clients never receive unowned Lead/Visit data.
 */

import type { AdminRole, LeadStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedAdmin } from "../middleware/auth.middleware.js";
import { getTodayISTDateString } from "../validators/lead.validator.js";

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

function timeSlotRank(timeSlot: string | null | undefined): number {
  switch (timeSlot) {
    case "Morning":
      return 1;
    case "Afternoon":
      return 2;
    case "Evening":
      return 3;
    default:
      return 4;
  }
}

export type DashboardLeadItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  developer: { id: string; name: string; slug: string } | null;
  project: { id: string; name: string; slug: string } | null;
  configuration: { id: string; name: string } | null;
  createdById: string | null;
  ownerId: string | null;
  createdBy: { id: string; name: string | null; email: string; role: AdminRole } | null;
  owner: { id: string; name: string | null; email: string; role: AdminRole } | null;
  message: string | null;
  visitDate: string | null;
  visitTime: string | null;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardMetrics = {
  totalLeads?: number;
  myLeads?: number;
  newLeads: number;
  todayVisits: number;
  inProgress: number;
  activeProjects?: number;
};

export type LeadPipelineSummary = {
  new: number;
  inProgress: number;
  done: number;
};

export type SharedRentalMetrics = {
  enquiryCount: number;
  availablePropertyCount: number;
};

export type DashboardDataResponse = {
  role: AdminRole;
  metrics: DashboardMetrics;
  leadPipeline: LeadPipelineSummary;
  todayVisits: DashboardLeadItem[];
  recentLeads: DashboardLeadItem[];
  rental: SharedRentalMetrics;
};

function formatLeadItem(lead: any): DashboardLeadItem {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    developer: lead.developer,
    project: lead.project,
    configuration: lead.configuration,
    createdById: lead.createdById ?? null,
    ownerId: lead.ownerId ?? null,
    createdBy: lead.createdBy ?? null,
    owner: lead.owner ?? null,
    message: lead.message,
    visitDate: lead.visitDate ?? null,
    visitTime: lead.visitTime ?? null,
    status: lead.status,
    notes: lead.notes,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export async function getDashboardData(
  actorAdmin: AuthenticatedAdmin,
): Promise<DashboardDataResponse> {
  const isFounder = actorAdmin.role === "FOUNDER";
  const todayDate = getTodayISTDateString();

  // Base Lead filter depending on actor role
  const leadOwnerFilter = isFounder ? {} : { ownerId: actorAdmin.id };

  // Run aggregation queries concurrently
  const [
    totalLeadsCount,
    newLeadsCount,
    inProgressLeadsCount,
    doneLeadsCount,
    rawTodayVisits,
    rawRecentLeads,
    rentalEnquiriesCount,
    rentalPropertiesCount,
    activeProjectsCount,
  ] = await Promise.all([
    // 1. Total / My Leads
    prisma.lead.count({ where: leadOwnerFilter }),
    // 2. New Leads
    prisma.lead.count({ where: { ...leadOwnerFilter, status: "NEW" } }),
    // 3. In-Progress Leads
    prisma.lead.count({ where: { ...leadOwnerFilter, status: "IN_PROGRESS" } }),
    // 4. Done Leads
    prisma.lead.count({ where: { ...leadOwnerFilter, status: "DONE" } }),
    // 5. Today's Scheduled Visits
    prisma.lead.findMany({
      where: {
        ...leadOwnerFilter,
        visitDate: todayDate,
      },
      select: leadSelect,
    }),
    // 6. Recent Leads (latest 5)
    prisma.lead.findMany({
      where: leadOwnerFilter,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5,
      select: leadSelect,
    }),
    // 7. Shared Rental Enquiries
    prisma.rentalEnquiry.count(),
    // 8. Shared Rental Available Properties
    prisma.rentalProperty.count(),
    // 9. Active Projects (only calculated for Founder)
    isFounder
      ? prisma.project.count({ where: { publishStatus: "PUBLISHED" } })
      : Promise.resolve(0),
  ]);

  // Sort today's visits:
  // 1. visitTime (Morning -> Afternoon -> Evening -> unspecified)
  // 2. createdAt ascending
  const todayVisitsFormatted = rawTodayVisits.map(formatLeadItem);
  todayVisitsFormatted.sort((a: DashboardLeadItem, b: DashboardLeadItem) => {
    const rankDiff = timeSlotRank(a.visitTime) - timeSlotRank(b.visitTime);
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const recentLeadsFormatted = rawRecentLeads.map(formatLeadItem);

  const metrics: DashboardMetrics = isFounder
    ? {
        totalLeads: totalLeadsCount,
        newLeads: newLeadsCount,
        todayVisits: todayVisitsFormatted.length,
        inProgress: inProgressLeadsCount,
        activeProjects: activeProjectsCount,
      }
    : {
        myLeads: totalLeadsCount,
        newLeads: newLeadsCount,
        todayVisits: todayVisitsFormatted.length,
        inProgress: inProgressLeadsCount,
      };

  return {
    role: actorAdmin.role,
    metrics,
    leadPipeline: {
      new: newLeadsCount,
      inProgress: inProgressLeadsCount,
      done: doneLeadsCount,
    },
    todayVisits: todayVisitsFormatted,
    recentLeads: recentLeadsFormatted,
    rental: {
      enquiryCount: rentalEnquiriesCount,
      availablePropertyCount: rentalPropertiesCount,
    },
  };
}
