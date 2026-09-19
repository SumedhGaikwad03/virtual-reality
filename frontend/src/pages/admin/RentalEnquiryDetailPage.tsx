/*
 * PURPOSE:
 * Administrative detail and triage page for a specific Rental Enquiry.
 *
 * FLOW:
 * AdminLayout -> RentalEnquiryDetailPage -> getRentalEnquiry / updateRentalEnquiry API.
 *
 * RESPONSIBILITY:
 * Displays full contact information, property requirements, seeker notes,
 * and enables status triage and private internal notes updates.
 */

import type { FormEvent } from "react";
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import {
  deleteRentalEnquiry,
  getRelevantAvailableProperties,
  getRentalEnquiry,
  updateRentalEnquiry,
} from "../../api/admin-rentals";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeleteRentalEnquiryModal } from "../../components/admin/DeleteRentalEnquiryModal";
import { RentalEnquiryActions } from "../../components/admin/RentalEnquiryActions";
import type {
  AdminRentalEnquiry,
  AdminRentalProperty,
  RentalEnquiryStatus,
} from "../../types/admin-rental";

const statuses: Array<{ value: RentalEnquiryStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "MATCHED", label: "Matched" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

function errorMessage(error: unknown, context: "load" | "update" | "delete" | "properties") {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (context === "properties") {
    if (error.status === null) return "Unable to reach the server. Please try again.";
    return "Unable to load available properties.";
  }
  if (error.status === 400) return "Please verify the update details.";
  if (error.status === 404) return "Rental enquiry not found.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  if (context === "delete") return "Unable to delete the enquiry. Please try again.";
  return context === "update"
    ? "Unable to update the enquiry. Please try again."
    : "Unable to load the enquiry. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function RentalEnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState<AdminRentalEnquiry | null>(null);
  const [status, setStatus] = useState<RentalEnquiryStatus>("NEW");
  const [internalNotes, setInternalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Relevant Available Properties state
  const [relevantProperties, setRelevantProperties] = useState<AdminRentalProperty[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProperties = useCallback(async (enquiryId: string) => {
    setIsLoadingProperties(true);
    setPropertiesError(null);
    try {
      const response = await getRelevantAvailableProperties(enquiryId);
      setRelevantProperties(response.data);
    } catch (requestError) {
      setPropertiesError(errorMessage(requestError, "properties"));
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getRentalEnquiry(id)
      .then((response) => {
        if (!active) return;
        setEnquiry(response.data);
        setStatus(response.data.status);
        setInternalNotes(response.data.internalNotes ?? "");
        void fetchProperties(id);
      })
      .catch((requestError: unknown) => {
        if (active) setError(errorMessage(requestError, "load"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, fetchProperties]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const response = await updateRentalEnquiry(id, { status, internalNotes });
      setEnquiry(response.data);
      setStatus(response.data.status);
      setInternalNotes(response.data.internalNotes ?? "");
      setSuccess(true);
    } catch (requestError) {
      setError(errorMessage(requestError, "update"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteRentalEnquiry(id);
      setIsDeleteModalOpen(false);
      navigate("/admin/rentals/enquiries");
    } catch (requestError) {
      setDeleteError(errorMessage(requestError, "delete"));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <p>Loading rental enquiry...</p>
      </AdminLayout>
    );
  }

  if (!enquiry) {
    return (
      <AdminLayout>
        <p>
          <Link className="admin-action admin-action--secondary" to="/admin/rentals/enquiries">
            ← Back to Enquiries
          </Link>
        </p>
        <p role="alert">{error ?? "Rental enquiry not found."}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-top-bar admin-top-bar--split">
        <Link className="admin-action admin-action--secondary" to="/admin/rentals/enquiries">
          ← Back to Enquiries
        </Link>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="admin-action admin-action--danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Enquiry
          </button>
        </div>
      </div>

      <h1>
        {enquiry.name} <span style={{ fontWeight: 400, color: "#64748b" }}>· {enquiry.configuration}</span>
      </h1>
      <RentalEnquiryActions enquiry={enquiry} />

      {error && <p role="alert" className="admin-alert-banner admin-alert-banner--error">{error}</p>}
      {success && (
        <p role="status" className="admin-alert-banner admin-alert-banner--success">
          Rental enquiry updated successfully.
        </p>
      )}

      {/* 1. CONTACT & REQUIREMENT DETAILS */}
      <section className="admin-card admin-lead-details">
        <h2>Seeker Contact</h2>
        <p><strong>Name:</strong> {enquiry.name}</p>
        <p><strong>Phone:</strong> {enquiry.phone}</p>
        <p><strong>Received:</strong> {formatDate(enquiry.createdAt)}</p>
        <p><strong>Last Updated:</strong> {formatDate(enquiry.updatedAt)}</p>

        <h2>Rental Requirement</h2>
        <p><strong>Configuration:</strong> {enquiry.configuration}</p>
        <p><strong>Area / Locality:</strong> {enquiry.areaLocality ?? "—"}</p>
        <p><strong>Location / City:</strong> {enquiry.location ?? "—"}</p>
        <p><strong>Budget:</strong> {enquiry.budget ?? "—"}</p>
        <p><strong>Furnishing Preference:</strong> {enquiry.furnishing ?? "—"}</p>
        <p><strong>Move-in Timeframe:</strong> {enquiry.moveInTimeframe ?? "—"}</p>
        <p><strong>Who is it for:</strong> {enquiry.whoIsFor ?? "—"}</p>

        <h2>Seeker Notes</h2>
        <p>{enquiry.notes || "No notes provided by the seeker."}</p>
      </section>

      {/* 2. RELEVANT AVAILABLE PROPERTIES */}
      <section className="admin-card admin-relevant-properties-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <div>
            <h2 style={{ margin: 0 }}>Available Properties</h2>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
              Available rental properties matching {enquiry.configuration} {enquiry.areaLocality || enquiry.location ? `in ${enquiry.areaLocality || enquiry.location}` : ""}.
            </p>
          </div>
          <Link
            to="/admin/rentals/available"
            className="admin-action admin-action--secondary"
            style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
          >
            View All Available →
          </Link>
        </div>

        {isLoadingProperties && (
          <p style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", margin: "0.5rem 0" }}>
            Finding available properties...
          </p>
        )}

        {propertiesError && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
            <p role="alert" style={{ margin: 0, color: "var(--admin-danger-text)", fontSize: "0.875rem" }}>
              {propertiesError}
            </p>
            <button
              type="button"
              className="admin-action admin-action--secondary"
              onClick={() => id && void fetchProperties(id)}
              style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoadingProperties && !propertiesError && relevantProperties.length === 0 && (
          <p style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", margin: "0.5rem 0" }}>
            No relevant available properties found.
          </p>
        )}

        {!isLoadingProperties && !propertiesError && relevantProperties.length > 0 && (
          <div className="admin-relevant-properties-grid">
            {relevantProperties.map((property) => (
              <article key={property.id} className="admin-relevant-property-card">
                <div className="admin-relevant-property-info">
                  <div className="admin-relevant-property-headline">
                    <strong>{property.flatType}</strong>
                    {property.approxSizeSqFt && (
                      <span className="admin-relevant-property-size">
                        ~{property.approxSizeSqFt.toLocaleString()} sq ft
                      </span>
                    )}
                    <span className="admin-lead-status status-available">
                      Available
                    </span>
                  </div>
                  <div className="admin-relevant-property-meta">
                    {property.societyDeveloper && (
                      <span className="admin-relevant-property-society">
                        {property.societyDeveloper}
                      </span>
                    )}
                    {(property.areaLocality || property.location) && (
                      <span className="admin-relevant-property-location">
                        {property.areaLocality || property.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="admin-relevant-property-action">
                  <Link
                    to={`/admin/rentals/available/${property.id}`}
                    className="admin-action admin-action--secondary"
                    style={{ fontSize: "0.825rem", padding: "0.35rem 0.65rem", whiteSpace: "nowrap" }}
                  >
                    View Property
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 3. ADMIN TRIAGE & INTERNAL NOTES */}
      <form className="admin-card admin-lead-update-form" onSubmit={handleSubmit}>
        <h2>Enquiry Triage & Status</h2>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as RentalEnquiryStatus)}>
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Internal notes (Admin only)
          <textarea
            rows={4}
            value={internalNotes}
            onChange={(event) => setInternalNotes(event.target.value)}
            placeholder="Private notes on client budget, conversations, site visits, or landlord matching..."
          />
        </label>
        <button className="admin-action admin-action--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteRentalEnquiryModal
        enquiry={isDeleteModalOpen ? enquiry : null}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
      />
    </AdminLayout>
  );
}

