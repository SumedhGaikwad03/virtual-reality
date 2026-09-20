/*
 * PURPOSE:
 * Administrative list and triage page for Rental Enquiries.
 *
 * FLOW:
 * AdminLayout -> RentalEnquiriesPage -> getRentalEnquiries API -> Table of seeker demands.
 *
 * RESPONSIBILITY:
 * Lists rental enquiries with keyword search, status filtering, pagination,
 * status badges, quick communication actions, and deletion confirmation.
 */

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { deleteRentalEnquiry, getRentalEnquiries } from "../../api/admin-rentals";
import { AddRentalEnquiryModal } from "../../components/admin/AddRentalEnquiryModal";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeleteRentalEnquiryModal } from "../../components/admin/DeleteRentalEnquiryModal";
import { RentalEnquiryActions } from "../../components/admin/RentalEnquiryActions";
import type {
  AdminRentalEnquiry,
  PaginationMeta,
  RentalEnquiryStatus,
} from "../../types/admin-rental";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return "Unable to load rental enquiries. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusLabel(status: RentalEnquiryStatus) {
  switch (status) {
    case "NEW":
      return "New";
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

function creatorLabel(enquiry: AdminRentalEnquiry) {
  const name = enquiry.createdBy?.name?.trim() || enquiry.createdBy?.email;
  return name ? `Created by ${name}` : "Created Organically";
}

export function RentalEnquiriesPage() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<AdminRentalEnquiry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RentalEnquiryStatus | "ALL">("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Deletion modal state
  const [enquiryToDelete, setEnquiryToDelete] = useState<AdminRentalEnquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRentalEnquiries({
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      setEnquiries(response.data);
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
    void fetchEnquiries();
  }, [fetchEnquiries]);

  async function handleDeleteConfirm() {
    if (!enquiryToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteRentalEnquiry(enquiryToDelete.id);
      setEnquiryToDelete(null);
      void fetchEnquiries();
    } catch (err) {
      setDeleteError(
        err instanceof AdminApiError && err.status === 404
          ? "Enquiry was already removed."
          : "Failed to delete rental enquiry. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const newEnquiryCount = enquiries.filter((e) => e.status === "NEW").length;

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Rental Enquiries</h1>
          <p>Manage people looking for rental homes.</p>
        </div>
        <button
          type="button"
          className="admin-action admin-action--primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add Enquiry
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <section className="admin-card admin-lead-toolbar">
        <div className="admin-lead-search-wrapper">
          <input
            type="search"
            className="admin-lead-search-input"
            placeholder="Search by keywords (e.g. 3 bhk baner, family, budget, wakad)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search rental enquiries"
          />
        </div>

        <div className="admin-lead-filter-wrapper">
          <label htmlFor="rental-status-filter" className="admin-lead-filter-label">
            Status
          </label>
          <div className="admin-lead-select-wrapper">
            <select
              id="rental-status-filter"
              className="admin-lead-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as RentalEnquiryStatus | "ALL");
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="MATCHED">Matched</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </section>

      {isLoading && <p>Loading rental enquiries...</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && enquiries.length === 0 && (
        <section className="admin-card">
          <p>No rental enquiries found {search || statusFilter !== "ALL" ? "matching your filters." : "yet."}</p>
        </section>
      )}

      {!isLoading && !error && enquiries.length > 0 && (
        <>
          <div className="admin-card admin-lead-list">
            {enquiries.map((enquiry) => (
              <article
                className={`admin-lead-row ${enquiry.status === "NEW" ? "is-new" : ""}`}
                key={enquiry.id}
              >
                <div>
                  <h2>
                    {enquiry.name}
                    {enquiry.status === "NEW" && (
                      <span className="admin-new-badge" aria-label="New enquiry">
                        NEW
                      </span>
                    )}
                  </h2>
                  <p>{enquiry.phone}</p>
                  <div className="admin-lead-creator">
                    <span className="admin-lead-creator-tag">
                      {creatorLabel(enquiry)}
                    </span>
                  </div>
                </div>
                <p>
                  <strong>{enquiry.configuration}</strong>
                </p>
                <p>{enquiry.areaLocality || enquiry.location || "—"}</p>
                <p>{enquiry.budget ? `Budget: ${enquiry.budget}` : "—"}</p>
                <p>
                  <span className={`admin-lead-status status-${enquiry.status.toLowerCase()}`}>
                    {statusLabel(enquiry.status)}
                  </span>
                </p>
                <p>{formatDate(enquiry.createdAt)}</p>
                <div className="admin-lead-row-actions">
                  <Link
                    className="admin-action admin-action--secondary"
                    to={`/admin/rentals/enquiries/${enquiry.id}`}
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    className="admin-action admin-action--danger"
                    onClick={() => setEnquiryToDelete(enquiry)}
                  >
                    Delete
                  </button>
                  <RentalEnquiryActions enquiry={enquiry} />
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total {pagination.total === 1 ? "enquiry" : "enquiries"})
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
      <DeleteRentalEnquiryModal
        enquiry={enquiryToDelete}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setEnquiryToDelete(null);
          setDeleteError(null);
        }}
      />

      {/* Add Rental Enquiry Modal */}
      <AddRentalEnquiryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newEnquiry) => {
          setIsAddModalOpen(false);
          navigate(`/admin/rentals/enquiries/${newEnquiry.id}`);
        }}
      />
    </AdminLayout>
  );
}
