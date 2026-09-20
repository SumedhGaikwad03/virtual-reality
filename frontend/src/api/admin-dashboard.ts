/*
 * PURPOSE:
 * Admin HTTP client for the unified role-aware dashboard endpoint.
 *
 * FLOW:
 * AdminDashboardPage -> admin-dashboard.ts -> adminRequest (/api/admin/dashboard) -> Express Backend.
 *
 * RESPONSIBILITY:
 * Fetches server-aggregated operational metrics, today's visits, recent leads, and rental stats.
 */

import { adminRequest } from "./admin-client";
import type { AdminDashboardResponse } from "../types/admin-dashboard";

export function getAdminDashboard() {
  return adminRequest<AdminDashboardResponse>("/admin/dashboard");
}
