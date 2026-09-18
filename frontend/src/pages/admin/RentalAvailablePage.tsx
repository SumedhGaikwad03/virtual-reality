/*
 * PURPOSE:
 * Administrative list and triage page for Available Rental Properties.
 *
 * FLOW:
 * AdminLayout -> RentalAvailablePage -> getRentalProperties API -> Table of landlord/owner supplies.
 *
 * RESPONSIBILITY:
 * Lists rental property submissions with keyword search, status filtering, pagination,
 * status badges, quick communication actions, and deletion confirmation.
 */

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { deleteRentalProperty, getRentalProperties } from "../../api/admin-rentals";
import { AddRentalPropertyModal } from "../../components/admin/AddRentalPropertyModal";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeleteRentalPropertyModal } from "../../components/admin/DeleteRentalPropertyModal";
import { RentalPropertyActions } from "../../components/admin/RentalPropertyActions";
import type {
  AdminRentalProperty,
  PaginationMeta,
  RentalPropertyStatus,
} from "../../types/admin-rental";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return "Unable to load rental properties. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusLabel(status: RentalPropertyStatus) {
  switch (status) {
    case "NEW":
      return "New";
    case "VERIFIED":
      return "Verified";
    case "AVAILABLE":
      return "Available";
    case "RENTED":
      return "Rented";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

export function RentalAvailablePage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<AdminRentalProperty[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RentalPropertyStatus | "ALL">("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Deletion modal state
  const [propertyToDelete, setPropertyToDelete] = useState<AdminRentalProperty | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRentalProperties({
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      setProperties(response.data);
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
    void fetchProperties();
  }, [fetchProperties]);

  async function handleDeleteConfirm() {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteRentalProperty(propertyToDelete.id);
      setPropertyToDelete(null);
      void fetchProperties();
    } catch (err) {
      setDeleteError(
        err instanceof AdminApiError && err.status === 404
          ? "Property was already removed."
          : "Failed to delete rental property. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1>Available Properties</h1>
          <p>Manage owner-submitted rental flats.</p>
        </div>
        <button
          type="button"
          className="admin-action admin-action--primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add Property
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <section className="admin-card admin-lead-toolbar">
        <div className="admin-lead-search-wrapper">
          <input
            type="search"
            className="admin-lead-search-input"
            placeholder="Search by keywords (e.g. 3 bhk baner, 1200 pune, rohan leher)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search available rental properties"
          />
        </div>

        <div className="admin-lead-filter-wrapper">
          <label htmlFor="rental-property-status-filter" className="admin-lead-filter-label">
            Status
          </label>
          <div className="admin-lead-select-wrapper">
            <select
              id="rental-property-status-filter"
              className="admin-lead-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as RentalPropertyStatus | "ALL");
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="VERIFIED">Verified</option>
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </section>

      {isLoading && <p>Loading available rental properties...</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && properties.length === 0 && (
        <section className="admin-card">
          <p>No rental properties found {search || statusFilter !== "ALL" ? "matching your filters." : "yet."}</p>
        </section>
      )}

      {!isLoading && !error && properties.length > 0 && (
        <>
          <div className="admin-card admin-lead-list">
            {properties.map((property) => (
              <article
                className={`admin-lead-row ${property.status === "NEW" ? "is-new" : ""}`}
                key={property.id}
              >
                <div>
                  <h2>
                    {property.ownerName}
                    {property.status === "NEW" && (
                      <span className="admin-new-badge" aria-label="New property submission">
                        NEW
                      </span>
                    )}
                  </h2>
                  <p>{property.phone}</p>
                </div>
                <p>
                  <strong>{property.flatType}</strong>
                </p>
                <p>
                  {property.approxSizeSqFt ? `${property.approxSizeSqFt.toLocaleString()} sq ft` : "—"}
                </p>
                <p>{property.areaLocality || property.location || "—"}</p>
                <p>{property.societyDeveloper || "—"}</p>
                <p>
                  <span className={`admin-lead-status status-${property.status.toLowerCase()}`}>
                    {statusLabel(property.status)}
                  </span>
                </p>
                <p>{formatDate(property.createdAt)}</p>
                <div className="admin-lead-row-actions">
                  <Link
                    className="admin-action admin-action--secondary"
                    to={`/admin/rentals/available/${property.id}`}
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    className="admin-action admin-action--danger"
                    onClick={() => setPropertyToDelete(property)}
                  >
                    Delete
                  </button>
                  <RentalPropertyActions property={property} />
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
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total {pagination.total === 1 ? "property" : "properties"})
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
      <DeleteRentalPropertyModal
        property={propertyToDelete}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setPropertyToDelete(null);
          setDeleteError(null);
        }}
      />

      {/* Add Rental Property Modal */}
      <AddRentalPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newProperty) => {
          setIsAddModalOpen(false);
          navigate(`/admin/rentals/available/${newProperty.id}`);
        }}
      />
    </AdminLayout>
  );
}
