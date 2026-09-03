/*
 * PURPOSE:
 * Presents the authenticated admin's operational landing page.
 *
 * FLOW:
 * Admin route -> existing lead/project admin APIs -> KPI, attention, and ongoing-work summary.
 *
 * RESPONSIBILITY:
 * Help an admin identify current lead work and reach common workflows without adding
 * a separate analytics or activity system.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getLeads } from "../../api/admin-leads";
import { getProjects } from "../../api/admin-projects";
import { useAuth } from "../../auth/AuthContext";
import { LeadActions } from "../../components/admin/LeadActions";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { AdminLead } from "../../types/admin-lead";
import type { AdminProject } from "../../types/admin-project";
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

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function errorMessage(error: unknown) {
  if (error instanceof AdminApiError && error.status === null) {
    return "Unable to reach the server. Please try again.";
  }
  return "Unable to load dashboard data. Please try again.";
}

function getAdminGreetingName(admin: AdminUser | null): string {
  if (!admin) return "Admin";
  if (admin.name && admin.name.trim()) return admin.name.trim();
  if (admin.email && admin.email.includes("@")) {
    const localPart = admin.email.split("@")[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }
  return "Admin";
}

export function AdminDashboardPage() {
  const { admin } = useAuth();
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getLeads(), getProjects()])
      .then(([leadsResponse, projectsResponse]) => {
        if (!active) return;
        setLeads(leadsResponse.data);
        setProjects(projectsResponse.data);
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

  const unattendedLeads = leads
    .filter((lead) => lead.status === "NEW")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const ongoingLeads = leads
    .filter((lead) => lead.status === "IN_PROGRESS")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const activeProjects = projects.filter((project) => project.publishStatus === "PUBLISHED");

  const greetingName = getAdminGreetingName(admin);

  return (
    <AdminLayout>
      <header className="admin-dashboard-heading">
        <p className="admin-dashboard-eyebrow">Admin Dashboard</p>
        <h1>Hello, {greetingName}</h1>
        <p>Here&apos;s what needs your attention today.</p>
      </header>

      {error && <p className="admin-alert admin-alert-error" role="alert">{error}</p>}

      <section className="admin-dashboard-kpis" aria-label="Key metrics">
        <article className="admin-card admin-kpi-card">
          <strong>{isLoading ? "—" : leads.filter((lead) => isToday(lead.createdAt)).length}</strong>
          <span>New Leads Today</span>
        </article>
        <article className="admin-card admin-kpi-card">
          <strong>{isLoading ? "—" : unattendedLeads.length}</strong>
          <span>Unattended Leads</span>
        </article>
        <article className="admin-card admin-kpi-card">
          <strong>{isLoading ? "—" : leads.filter((lead) => lead.status === "IN_PROGRESS").length}</strong>
          <span>Ongoing Leads</span>
        </article>
        <article className="admin-card admin-kpi-card">
          <strong>{isLoading ? "—" : activeProjects.length}</strong>
          <span>Active Projects</span>
        </article>
      </section>

      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-heading">
          <div>
            <h2>Needs attention</h2>
            <p>Recent enquiries that have not been contacted yet.</p>
          </div>
          <Link className="admin-action admin-action--utility" to="/admin/leads">
            View all leads →
          </Link>
        </div>

        {isLoading && <p>Loading leads...</p>}
        {!isLoading && unattendedLeads.length === 0 && (
          <div className="admin-card admin-empty-card">
            <p>You&apos;re all caught up. No unattended leads right now.</p>
          </div>
        )}
        {!isLoading && unattendedLeads.length > 0 && (
          <div className="admin-dashboard-leads">
            {unattendedLeads.slice(0, 5).map((lead) => (
              <article className="admin-card admin-dashboard-lead" key={lead.id}>
                <div className="admin-dashboard-lead-info">
                  <h3>{lead.name}</h3>
                  <p>
                    {lead.project?.name ?? "General enquiry"}
                    {lead.configuration?.name ? ` · ${lead.configuration.name}` : ""}
                  </p>
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

      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-heading">
          <div>
            <h2>Ongoing leads</h2>
            <p>Enquiries currently being worked on.</p>
          </div>
          <Link className="admin-action admin-action--utility" to="/admin/leads">
            View all leads →
          </Link>
        </div>

        {!isLoading && ongoingLeads.length === 0 && (
          <div className="admin-card admin-empty-card">
            <p>No ongoing leads right now.</p>
          </div>
        )}
        {!isLoading && ongoingLeads.length > 0 && (
          <div className="admin-dashboard-leads">
            {ongoingLeads.slice(0, 5).map((lead) => (
              <article className="admin-card admin-dashboard-lead" key={lead.id}>
                <div className="admin-dashboard-lead-info">
                  <h3>{lead.name}</h3>
                  <p>
                    {lead.project?.name ?? "General enquiry"}
                    {lead.configuration?.name ? ` · ${lead.configuration.name}` : ""}
                  </p>
                </div>
                <span className="admin-dashboard-lead-time">{relativeTime(lead.updatedAt)}</span>
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
    </AdminLayout>
  );
}
