/*
 * PURPOSE:
 * Administrative detail and triage page for a specific Available Rental Property.
 *
 * FLOW:
 * AdminLayout -> RentalAvailableDetailPage -> getRentalProperty / updateRentalProperty API.
 *
 * RESPONSIBILITY:
 * Displays full owner contact information, flat specifications, landlord notes,
 * and enables status triage and private internal notes updates.
 */

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import {
  deleteRentalProperty,
  getRentalProperty,
  updateRentalProperty,
} from "../../api/admin-rentals";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeleteRentalPropertyModal } from "../../components/admin/DeleteRentalPropertyModal";
import { RentalPropertyActions } from "../../components/admin/RentalPropertyActions";
import type {
  AdminRentalProperty,
  RentalPropertyStatus,
} from "../../types/admin-rental";

const statuses: Array<{ value: RentalPropertyStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "VERIFIED", label: "Verified" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RENTED", label: "Rented" },
  { value: "ARCHIVED", label: "Archived" },
];

function errorMessage(error: unknown, context: "load" | "update" | "delete") {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === 400) return "Please verify the update details.";
  if (error.status === 404) return "Rental property not found.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  if (context === "delete") return "Unable to delete the property. Please try again.";
  return context === "update"
    ? "Unable to update the property. Please try again."
    : "Unable to load the property. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function RentalAvailableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<AdminRentalProperty | null>(null);
  const [status, setStatus] = useState<RentalPropertyStatus>("NEW");
  const [internalNotes, setInternalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getRentalProperty(id)
      .then((response) => {
        if (!active) return;
        setProperty(response.data);
        setStatus(response.data.status);
        setInternalNotes(response.data.internalNotes ?? "");
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
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const response = await updateRentalProperty(id, { status, internalNotes });
      setProperty(response.data);
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
      await deleteRentalProperty(id);
      setIsDeleteModalOpen(false);
      navigate("/admin/rentals/available");
    } catch (requestError) {
      setDeleteError(errorMessage(requestError, "delete"));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <p>Loading rental property...</p>
      </AdminLayout>
    );
  }

  if (!property) {
    return (
      <AdminLayout>
        <p>
          <Link className="admin-action admin-action--secondary" to="/admin/rentals/available">
            ← Back to Available
          </Link>
        </p>
        <p role="alert">{error ?? "Rental property not found."}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-top-bar admin-top-bar--split">
        <Link className="admin-action admin-action--secondary" to="/admin/rentals/available">
          ← Back to Available
        </Link>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="admin-action admin-action--danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Property
          </button>
        </div>
      </div>

      <h1>
        {property.ownerName} <span style={{ fontWeight: 400, color: "#64748b" }}>· {property.flatType}</span>
      </h1>
      <RentalPropertyActions property={property} />

      {error && <p role="alert" className="admin-alert-banner admin-alert-banner--error">{error}</p>}
      {success && (
        <p role="status" className="admin-alert-banner admin-alert-banner--success">
          Rental property updated successfully.
        </p>
      )}

      {/* 1. CONTACT & PROPERTY SPECIFICATIONS */}
      <section className="admin-card admin-lead-details">
        <h2>Owner Contact</h2>
        <p><strong>Name:</strong> {property.ownerName}</p>
        <p><strong>Phone:</strong> {property.phone}</p>
        <p><strong>Submitted:</strong> {formatDate(property.createdAt)}</p>
        <p><strong>Last Updated:</strong> {formatDate(property.updatedAt)}</p>

        <h2>Property Information</h2>
        <p><strong>Flat Type / BHK:</strong> {property.flatType}</p>
        <p><strong>Approximate Size:</strong> {property.approxSizeSqFt ? `${property.approxSizeSqFt.toLocaleString()} sq ft` : "—"}</p>
        <p><strong>Society / Developer:</strong> {property.societyDeveloper ?? "—"}</p>
        <p><strong>Area / Locality:</strong> {property.areaLocality ?? "—"}</p>
        <p><strong>Location / City:</strong> {property.location ?? "—"}</p>

        <h2>Additional Details</h2>
        <p>{property.additionalDetails || "No additional details provided by the owner."}</p>
      </section>

      {/* 2. ADMIN TRIAGE & INTERNAL NOTES */}
      <form className="admin-card admin-lead-update-form" onSubmit={handleSubmit}>
        <h2>Property Triage & Status</h2>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as RentalPropertyStatus)}>
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
            placeholder="Private notes on expected rent, deposit, keys, verification status, tenant preferences, or visit schedules..."
          />
        </label>
        <button className="admin-action admin-action--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteRentalPropertyModal
        property={isDeleteModalOpen ? property : null}
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
