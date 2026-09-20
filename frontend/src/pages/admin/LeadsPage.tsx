import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { deleteLead, getLeads } from "../../api/admin-leads";
import { deleteRentalEnquiry } from "../../api/admin-rentals";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeleteLeadModal } from "../../components/admin/DeleteLeadModal";
import { LeadActions } from "../../components/admin/LeadActions";
import { LeadNotificationControl } from "../../components/admin/LeadNotificationControl";
import type { AdminLead, PaginationMeta, UnifiedLeadType } from "../../types/admin-lead";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return "Unable to load leads. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusLabel(status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return "Ongoing";
    case "NEW":
      return "New";
    case "DONE":
      return "Done";
    case "CONTACTED":
      return "Contacted";
    case "MATCHED":
      return "Matched";
    case "CLOSED":
      return "Closed";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

function creatorLabel(lead: AdminLead) {
  const name = lead.createdBy?.name?.trim() || lead.createdBy?.email;
  return name ? `Created by ${name}` : "Created Organically";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<UnifiedLeadType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input by 250ms to avoid out-of-order responses and race conditions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

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
        search: debouncedSearch.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        type: typeFilter === "ALL" ? undefined : typeFilter,
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
  }, [page, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  async function handleDeleteConfirm() {
    if (!leadToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (leadToDelete.type === "RENTAL") {
        await deleteRentalEnquiry(leadToDelete.id);
      } else {
        await deleteLead(leadToDelete.id);
      }
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
            placeholder="Search leads by name, phone, project, configuration, notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search leads"
          />
          {search && (
            <button
              type="button"
              className="admin-lead-search-clear-btn"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="admin-lead-filter-wrapper">
          <label htmlFor="lead-type-filter" className="admin-lead-filter-label">
            Type
          </label>
          <div className="admin-lead-select-wrapper">
            <select
              id="lead-type-filter"
              className="admin-lead-filter-select"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as UnifiedLeadType | "ALL");
                setPage(1);
              }}
            >
              <option value="ALL">All Leads</option>
              <option value="PROPERTY">Property Leads</option>
              <option value="RENTAL">Rental Enquiries</option>
            </select>
          </div>
        </div>

        {/* Status Filter */}
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
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              {typeFilter !== "RENTAL" && (
                <>
                  <option value="IN_PROGRESS">Ongoing</option>
                  <option value="DONE">Done</option>
                </>
              )}
              {typeFilter !== "PROPERTY" && (
                <>
                  <option value="CONTACTED">Contacted</option>
                  <option value="MATCHED">Matched</option>
                  <option value="CLOSED">Closed</option>
                  <option value="ARCHIVED">Archived</option>
                </>
              )}
            </select>
          </div>
        </div>
      </section>

      {isLoading && <p>Loading leads...</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && leads.length === 0 && (
        <section className="admin-card">
          {search.trim() ? (
            <p>
              No leads match "<strong>{search.trim()}</strong>"
              {statusFilter !== "ALL" ? ` with status ${statusLabel(statusFilter)}` : ""}.{" "}
              <button
                type="button"
                className="admin-link-button"
                style={{ background: "none", border: "none", color: "var(--admin-primary, #18382E)", textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                Clear search
              </button>
            </p>
          ) : statusFilter !== "ALL" ? (
            <p>
              No leads found with status {statusLabel(statusFilter)}.{" "}
              <button
                type="button"
                className="admin-link-button"
                style={{ background: "none", border: "none", color: "var(--admin-primary, #18382E)", textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}
                onClick={() => {
                  setStatusFilter("ALL");
                  setPage(1);
                }}
              >
                Show all statuses
              </button>
            </p>
          ) : (
            <p>No leads found.</p>
          )}
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
                  <div className="admin-lead-creator" style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                    <span className={`admin-lead-type-tag ${lead.type === "RENTAL" ? "admin-lead-type-tag--rental" : "admin-lead-type-tag--property"}`}>
                      {lead.type === "RENTAL" ? "Rental Enquiry" : "Property Lead"}
                    </span>
                    <span className="admin-lead-creator-tag">
                      {creatorLabel(lead)}
                    </span>
                  </div>
                </div>

                {lead.type === "RENTAL" ? (
                  <>
                    <p><strong>{lead.rentalConfiguration || "Rental Seeker"}</strong></p>
                    <p>{lead.areaLocality || lead.location || "—"}</p>
                    <p>{lead.budget ? `Budget: ${lead.budget}` : "—"}</p>
                  </>
                ) : (
                  <>
                    <p>{lead.developer?.name ?? "—"}</p>
                    <p>{lead.project?.name ?? "General enquiry"}</p>
                    <p>{lead.configuration?.name ?? "—"}</p>
                  </>
                )}

                <p>
                  <span className={`admin-lead-status status-${lead.status.toLowerCase()}`}>
                    {statusLabel(lead.status)}
                  </span>
                </p>
                <p>{formatDate(lead.createdAt)}</p>
                <div className="admin-lead-row-actions">
                  <Link
                    className="admin-action admin-action--secondary"
                    to={lead.type === "RENTAL" ? `/admin/rentals/enquiries/${lead.id}` : `/admin/leads/${lead.id}`}
                  >
                    View
                  </Link>
                  {lead.type !== "RENTAL" && (
                    <Link className="admin-action admin-action--secondary" to={`/admin/leads/${lead.id}/edit`}>
                      Edit
                    </Link>
                  )}
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
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total {pagination.total === 1 ? "lead" : "leads"})
              </span>
              <div className="admin-pagination-buttons">
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
