/*
 * PURPOSE:
 * TypeScript types and DTO definitions for the Admin Dashboard.
 *
 * FLOW:
 * Admin Dashboard API -> admin-dashboard.ts -> AdminDashboardPage.tsx
 *
 * RESPONSIBILITY:
 * Strongly-typed contracts for role-scoped operational metrics, pipeline summaries,
 * today's visits, recent leads, and shared rental statistics.
 */

import type { AdminRole } from "../auth/types";
import type { AdminLead } from "./admin-lead";

export type AdminDashboardMetrics = {
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

export type AdminDashboardData = {
  role: AdminRole;
  metrics: AdminDashboardMetrics;
  leadPipeline: LeadPipelineSummary;
  todayVisits: AdminLead[];
  recentLeads: AdminLead[];
  rental: SharedRentalMetrics;
};

export type AdminDashboardResponse = {
  data: AdminDashboardData;
};
