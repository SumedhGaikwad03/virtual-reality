/*
 * PURPOSE:
 * Confirmation modal dialog for rental property deletion.
 *
 * FLOW:
 * RentalAvailablePage / RentalAvailableDetailPage -> DeleteRentalPropertyModal -> deleteRentalProperty API.
 *
 * RESPONSIBILITY:
 * Prevents accidental deletion of rental property records with clear confirmation,
 * property details preview, deletion progress state, and error feedback.
 */

import { useEffect } from "react";
import type { AdminRentalProperty } from "../../types/admin-rental";

type DeleteRentalPropertyModalProps = {
  property: AdminRentalProperty | null;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function DeleteRentalPropertyModal({
  property,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeleteRentalPropertyModalProps) {
  useEffect(() => {
    if (!property) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [property, isDeleting, onCancel]);

  if (!property) return null;

  const locationInfo = property.societyDeveloper || property.areaLocality || property.location;

  return (
    <div
      className="admin-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-rental-property-title"
      aria-describedby="delete-rental-property-desc"
    >
      <div className="admin-card admin-delete-modal-card">
        <header className="admin-delete-modal-header">
          <div className="admin-delete-modal-icon" aria-hidden="true">
            ⚠
          </div>
          <div>
            <h2 id="delete-rental-property-title">Delete this rental property?</h2>
            <p id="delete-rental-property-desc">
              This action permanently removes the property record from the database.
            </p>
          </div>
        </header>

        <div className="admin-delete-preview-box">
          <div className="admin-delete-meta">
            <strong>{property.ownerName}</strong>
            <span>{property.phone}</span>
            <span className="admin-delete-url-hint">
              Property: {property.flatType}
              {locationInfo ? ` · ${locationInfo}` : ""}
              {property.approxSizeSqFt ? ` · ${property.approxSizeSqFt.toLocaleString()} sq ft` : ""}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="admin-alert-banner admin-alert-banner--error" role="alert">
            ⚠ {errorMessage}
          </div>
        )}

        <footer className="admin-delete-modal-actions">
          <button
            type="button"
            className="admin-action admin-action--secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-action admin-action--danger"
            onClick={() => void onConfirm()}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Property"}
          </button>
        </footer>
      </div>
    </div>
  );
}
