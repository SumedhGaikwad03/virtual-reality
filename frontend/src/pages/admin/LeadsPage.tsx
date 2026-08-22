import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getLeads } from "../../api/admin-leads";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { AdminLead } from "../../types/admin-lead";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return "Unable to load leads. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function LeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getLeads()
      .then((response) => {
        if (active) setLeads(response.data);
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

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Leads</h1>
          <p>Review and manage enquiries from the public site.</p>
        </div>
      </div>
      {isLoading && <p>Loading leads...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && leads.length === 0 && (
        <section className="admin-card"><p>No leads found.</p></section>
      )}
      {!isLoading && !error && leads.length > 0 && (
        <div className="admin-card admin-lead-list">
          {leads.map((lead) => (
            <article className="admin-lead-row" key={lead.id}>
              <div><h2>{lead.name}</h2><p>{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</p></div>
              <p>{lead.project?.name ?? "General enquiry"}</p>
              <p>{lead.configuration?.name ?? "—"}</p>
              <p>{lead.status}</p>
              <p>{formatDate(lead.createdAt)}</p>
              <Link to={`/admin/leads/${lead.id}`}>View</Link>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
