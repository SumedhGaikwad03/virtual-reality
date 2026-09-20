/*
 * PURPOSE:
 * Operational dashboard tailored for Founder and Employee administrator roles.
 *
 * FLOW:
 * Admin Route -> admin-dashboard.ts (GET /api/admin/dashboard) -> Role-scoped operational views.
 *
 * RESPONSIBILITY:
 * - FOUNDER: Workspace-wide KPIs (Total Leads, New Leads, Today's Visits, In Progress, Active Projects),
 *   Lead status pipeline breakdown, all scheduled today visits, all recent leads, and shared rentals.
 * - EMPLOYEE: Workload-specific KPIs (My Leads, New Leads, My Visits, In Progress),
 *   personal lead pipeline, today's visits for owned leads, recent owned leads, and shared rentals.
 * - Displays authentic creator attribution while operational visibility remains strictly owner-scoped.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getAdminDashboard } from "../../api/admin-dashboard";
import { useAuth } from "../../auth/AuthContext";
import { LeadActions } from "../../components/admin/LeadActions";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { AdminDashboardData } from "../../types/admin-dashboard";
import type { AdminLead, LeadStatus } from "../../types/admin-lead";
import type { AdminUser } from "../../auth/types";

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function errorMessage(error: unknown) {
  if (error instanceof AdminApiError && error.status === null) {
    return "Unable to reach the server. Please try again.";
  }
  return "Unable to load dashboard data. Please try again.";
}

function getAdminFirstName(admin: AdminUser | null): string | null {
  if (!admin) return null;
  if (admin.name && admin.name.trim()) {
    const parts = admin.name.trim().split(/\s+/);
    if (parts.length > 0 && parts[0]) {
      return parts[0];
    }
  }
  if (admin.email && admin.email.includes("@")) {
    const localPart = admin.email.split("@")[0];
    if (localPart && !localPart.toLowerCase().startsWith("admin")) {
      return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
  }
  return null;
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

function creatorLabel(lead: AdminLead): string {
  if (lead.createdById && lead.createdBy) {
    return `Created by ${lead.createdBy.name || lead.createdBy.email}`;
  }
  return "Created Organically";
}

function statusLabel(status: LeadStatus): string {
  switch (status) {
    case "NEW":
      return "New";
    case "IN_PROGRESS":
      return "In Progress";
    case "DONE":
      return "Done";
    default:
      return status;
  }
}

export function AdminDashboardPage() {
  const { admin } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getAdminDashboard()
      .then((response) => {
        if (!active) return;
        setData(response.data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const isFounder = admin?.role === "FOUNDER";
  const firstName = getAdminFirstName(admin);
  const timeGreeting = getTimeOfDayGreeting();
  const greetingHeadline = firstName ? `${timeGreeting}, ${firstName}.` : "Welcome back.";
  const greetingSubtitle = isFounder
    ? "Here’s what’s happening across your workspace."
    : "Here’s what needs your attention.";

  return (
    <AdminLayout>
      <header className="admin-dashboard-heading">
        <p className="admin-dashboard-eyebrow">
          {isFounder ? "Workspace Overview" : "Personal Workload"}
        </p>
        <h1>{greetingHeadline}</h1>
        <p>{greetingSubtitle}</p>
      </header>

      {error && <p className="admin-alert admin-alert-error" role="alert">{error}</p>}

      {/* =====================================================================
          KPI Section
          ===================================================================== */}
      <section className="admin-dashboard-kpis" aria-label="Key metrics">
        {isFounder ? (
          <article className="admin-card admin-kpi-card">
            <strong>{isLoading ? "—" : data?.metrics.totalLeads ?? 0}</strong>
            <span>Total Leads</span>
          </article>
        ) : (
          <article className="admin-card admin-kpi-card">
            <strong>{isLoading ? "—" : data?.metrics.myLeads ?? 0}</strong>
            <span>My Leads</span>
          </article>
        )}

        <article className="admin-card admin-kpi-card">
          <strong>{isLoading ? "—" : data?.metrics.newLeads ?? 0}</strong>
          <span>New Leads</span>
        </article>

        <article className="admin-card admin-kpi-card">
          <strong>{isLoading ? "—" : data?.metrics.todayVisits ?? 0}</strong>
          <span>{isFounder ? "Today's Visits" : "My Visits Today"}</span>
        </article>

        <article className="admin-card admin-kpi-card">
          <strong>{isLoading ? "—" : data?.metrics.inProgress ?? 0}</strong>
          <span>In Progress</span>
        </article>

        {isFounder && data?.metrics.activeProjects !== undefined && (
          <article className="admin-card admin-kpi-card">
            <strong>{isLoading ? "—" : data.metrics.activeProjects}</strong>
            <span>Active Projects</span>
          </article>
        )}
      </section>

      {/* =====================================================================
          Lead Pipeline Breakdown
          ===================================================================== */}
      <section className="admin-dashboard-section" aria-label="Lead pipeline status">
        <div className="admin-dashboard-section-heading">
          <div>
            <h2>Lead Pipeline</h2>
            <p>
              {isFounder
                ? "Organization-wide status summary across active pipeline."
                : "Status summary of leads currently assigned to you."}
            </p>
          </div>
          <Link className="admin-action admin-action--utility" to="/admin/leads">
            View all leads →
          </Link>
        </div>

        <div className="admin-dashboard-pipeline-grid">
          <div className="admin-card admin-pipeline-card">
            <span className="admin-pipeline-label">New</span>
            <strong className="admin-pipeline-count count-new">
              {isLoading ? "—" : data?.leadPipeline.new ?? 0}
            </strong>
          </div>
          <div className="admin-card admin-pipeline-card">
            <span className="admin-pipeline-label">In Progress</span>
            <strong className="admin-pipeline-count count-progress">
              {isLoading ? "—" : data?.leadPipeline.inProgress ?? 0}
            </strong>
          </div>
          <div className="admin-card admin-pipeline-card">
            <span className="admin-pipeline-label">Done</span>
            <strong className="admin-pipeline-count count-done">
              {isLoading ? "—" : data?.leadPipeline.done ?? 0}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================================
          Today's Scheduled Visits
          ===================================================================== */}
      <section className="admin-dashboard-section" aria-label="Today's visits">
        <div className="admin-dashboard-section-heading">
          <div>
            <h2>Today&apos;s Visits</h2>
            <p>
              {isFounder
                ? "Scheduled customer property visits across the organization today."
                : "Scheduled customer property visits assigned to you today."}
            </p>
          </div>
          <Link className="admin-action admin-action--utility" to="/admin/visits">
            View visit triage →
          </Link>
        </div>

        {isLoading && <p>Loading today&apos;s visits...</p>}

        {!isLoading && (!data?.todayVisits || data.todayVisits.length === 0) && (
          <div className="admin-card admin-empty-card">
            <p>No visits scheduled for today.</p>
          </div>
        )}

        {!isLoading && data?.todayVisits && data.todayVisits.length > 0 && (
          <div className="admin-dashboard-visits-grid">
            {data.todayVisits.map((visit) => (
              <article className="admin-card admin-dashboard-visit-card" key={visit.id}>
                <div className="admin-dashboard-visit-header">
                  <span className="admin-dashboard-visit-time">
                    {visit.visitTime ?? "Today"}
                  </span>
                  <span className={`admin-lead-status status-${visit.status.toLowerCase()}`}>
                    {statusLabel(visit.status)}
                  </span>
                </div>

                <div className="admin-dashboard-visit-body">
                  <h3>{visit.name}</h3>
                  <p className="admin-dashboard-visit-phone">{visit.phone}</p>
                  <p className="admin-dashboard-visit-project">
                    {visit.project?.name ?? "General Enquiry"}
                    {visit.configuration?.name ? ` · ${visit.configuration.name}` : ""}
                  </p>
                  <div className="admin-lead-creator">
                    <span className="admin-lead-creator-tag">
                      {creatorLabel(visit)}
                    </span>
                  </div>
                </div>

                <div className="admin-dashboard-visit-actions">
                  <Link className="admin-action admin-action--secondary" to={`/admin/leads/${visit.id}`}>
                    View
                  </Link>
                  <LeadActions lead={visit} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          Recent Leads
          ===================================================================== */}
      <section className="admin-dashboard-section" aria-label="Recent leads">
        <div className="admin-dashboard-section-heading">
          <div>
            <h2>Recent Leads</h2>
            <p>
              {isFounder
                ? "Latest inbound customer enquiries across the workspace."
                : "Latest enquiries assigned to you."}
            </p>
          </div>
          <Link className="admin-action admin-action--utility" to="/admin/leads">
            View all leads →
          </Link>
        </div>

        {isLoading && <p>Loading recent leads...</p>}

        {!isLoading && (!data?.recentLeads || data.recentLeads.length === 0) && (
          <div className="admin-card admin-empty-card">
            <p>{isFounder ? "No leads yet." : "No leads assigned to you yet."}</p>
          </div>
        )}

        {!isLoading && data?.recentLeads && data.recentLeads.length > 0 && (
          <div className="admin-dashboard-leads">
            {data.recentLeads.map((lead) => (
              <article className="admin-card admin-dashboard-lead" key={lead.id}>
                <div className="admin-dashboard-lead-info">
                  <div className="admin-dashboard-lead-title-row">
                    <h3>{lead.name}</h3>
                    <span className={`admin-lead-status status-${lead.status.toLowerCase()}`}>
                      {statusLabel(lead.status)}
                    </span>
                  </div>
                  <p>
                    {lead.project?.name ?? "General enquiry"}
                    {lead.configuration?.name ? ` · ${lead.configuration.name}` : ""}
                  </p>
                  <div className="admin-lead-creator">
                    <span className="admin-lead-creator-tag">
                      {creatorLabel(lead)}
                    </span>
                  </div>
                </div>
                <span className="admin-dashboard-lead-time">{relativeTime(lead.createdAt)}</span>
                <div className="admin-dashboard-lead-actions">
                  <Link className="admin-action admin-action--secondary" to={`/admin/leads/${lead.id}`}>
                    View
                  </Link>
                  <LeadActions lead={lead} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          Shared Rental Operations
          ===================================================================== */}
      <section className="admin-dashboard-section" aria-label="Shared rental operations">
        <div className="admin-dashboard-section-heading">
          <div>
            <h2>Rental Operations</h2>
            <p>Shared operational queues for customer demand and landlord supply.</p>
          </div>
        </div>

        <div className="admin-dashboard-rental-grid">
          <article className="admin-card admin-rental-kpi-card">
            <div>
              <span className="admin-rental-kpi-eyebrow">Seeker Demand</span>
              <strong className="admin-rental-kpi-count">
                {isLoading ? "—" : data?.rental.enquiryCount ?? 0}
              </strong>
              <p className="admin-rental-kpi-desc">Rental Enquiries in queue</p>
            </div>
            <Link className="admin-action admin-action--secondary" to="/admin/rentals/enquiries">
              View enquiries →
            </Link>
          </article>

          <article className="admin-card admin-rental-kpi-card">
            <div>
              <span className="admin-rental-kpi-eyebrow">Landlord Supply</span>
              <strong className="admin-rental-kpi-count">
                {isLoading ? "—" : data?.rental.availablePropertyCount ?? 0}
              </strong>
              <p className="admin-rental-kpi-desc">Available Properties listed</p>
            </div>
            <Link className="admin-action admin-action--secondary" to="/admin/rentals/available">
              View available properties →
            </Link>
          </article>
        </div>
      </section>
    </AdminLayout>
  );
}
