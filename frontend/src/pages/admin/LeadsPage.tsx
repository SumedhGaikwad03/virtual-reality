import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { deleteLead, getLeads } from "../../api/admin-leads";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeleteLeadModal } from "../../components/admin/DeleteLeadModal";
import { LeadActions } from "../../components/admin/LeadActions";
import { LeadNotificationControl } from "../../components/admin/LeadNotificationControl";
import type { AdminLead, LeadStatus, PaginationMeta } from "../../types/admin-lead";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return "Unable to load leads. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusLabel(status: AdminLead["status"]) {
  return status === "IN_PROGRESS" ? "Ongoing" : status;
}

export function LeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [leadToDelete, setLeadToDelete] = useState<AdminLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getLeads({
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      setLeads(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (requestError: unknown) {
      setError(errorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  async function handleDeleteConfirm() {
    if (!leadToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteLead(leadToDelete.id);
      setLeadToDelete(null);
      void fetchLeads();
    } catch (err) {
      setDeleteError(
        err instanceof AdminApiError && err.status === 404
          ? "Lead was already removed."
          : "Failed to delete lead. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Leads</h1>
          <p>Review, create, and manage customer enquiries.</p>
        </div>
        <div>
          <Link className="admin-action admin-action--primary" to="/admin/leads/new">
            + Add Lead
          </Link>
        </div>
      </div>

      <section className="admin-card admin-lead-notifications">
        <LeadNotificationControl />
      </section>

      {/* Search & Filter Toolbar */}
      <section className="admin-card admin-lead-toolbar">
        <div className="admin-lead-search-wrapper">
          <input
            type="search"
            className="admin-lead-search-input"
            placeholder="Search by name, phone, email, notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search leads"
          />
        </div>

        <div className="admin-lead-filter-wrapper">
          <label htmlFor="lead-status-filter" className="admin-lead-filter-label">
            Status
          </label>
          <div className="admin-lead-select-wrapper">
            <select
              id="lead-status-filter"
              className="admin-lead-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as LeadStatus | "ALL");
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">Ongoing</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
      </section>

      {isLoading && <p>Loading leads...</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && leads.length === 0 && (
        <section className="admin-card">
          <p>No leads found {search || statusFilter !== "ALL" ? "matching your filters." : "."}</p>
        </section>
      )}

      {!isLoading && !error && leads.length > 0 && (
        <>
          <div className="admin-card admin-lead-list">
            {leads.map((lead) => (
              <article className={`admin-lead-row ${lead.status === "NEW" ? "is-new" : ""}`} key={lead.id}>
                <div>
                  <h2>
                    {lead.name}
                    {lead.status === "NEW" && (
                      <span className="admin-new-badge" aria-label="New lead">
                        NEW
                      </span>
                    )}
                  </h2>
                  <p>{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</p>
                </div>
                <p>{lead.developer?.name ?? "—"}</p>
                <p>{lead.project?.name ?? "General enquiry"}</p>
                <p>{lead.configuration?.name ?? "—"}</p>
                <p>
                  <span className={`admin-lead-status status-${lead.status.toLowerCase()}`}>
                    {statusLabel(lead.status)}
                  </span>
                </p>
                <p>{formatDate(lead.createdAt)}</p>
                <div className="admin-lead-row-actions">
                  <Link className="admin-action admin-action--secondary" to={`/admin/leads/${lead.id}`}>
                    View
                  </Link>
                  <Link className="admin-action admin-action--secondary" to={`/admin/leads/${lead.id}/edit`}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="admin-action admin-action--danger"
                    onClick={() => setLeadToDelete(lead)}
                  >
                    Delete
                  </button>
                  <LeadActions lead={lead} />
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "1.25rem",
                padding: "0.5rem 0",
              }}
            >
              <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total {pagination.total === 1 ? "lead" : "leads"})
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-action admin-action--secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="admin-action admin-action--secondary"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteLeadModal
        lead={leadToDelete}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setLeadToDelete(null);
          setDeleteError(null);
        }}
      />
    </AdminLayout>
  );
}
