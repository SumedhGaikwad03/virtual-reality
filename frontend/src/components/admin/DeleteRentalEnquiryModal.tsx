/*
 * PURPOSE:
 * Confirmation modal dialog for rental enquiry deletion.
 *
 * FLOW:
 * RentalEnquiriesPage / RentalEnquiryDetailPage -> DeleteRentalEnquiryModal -> deleteRentalEnquiry API.
 *
 * RESPONSIBILITY:
 * Prevents accidental deletion of rental enquiry records with clear confirmation,
 * seeker requirement preview, deletion progress state, and error feedback.
 */

import { useEffect } from "react";
import type { AdminRentalEnquiry } from "../../types/admin-rental";

type DeleteRentalEnquiryModalProps = {
  enquiry: AdminRentalEnquiry | null;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function DeleteRentalEnquiryModal({
  enquiry,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeleteRentalEnquiryModalProps) {
  useEffect(() => {
    if (!enquiry) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enquiry, isDeleting, onCancel]);

  if (!enquiry) return null;

  const locationInfo = enquiry.areaLocality || enquiry.location;

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
      aria-labelledby="delete-rental-enquiry-title"
      aria-describedby="delete-rental-enquiry-desc"
    >
      <div className="admin-card admin-delete-modal-card">
        <header className="admin-delete-modal-header">
          <div className="admin-delete-modal-icon" aria-hidden="true">
            ⚠
          </div>
          <div>
            <h2 id="delete-rental-enquiry-title">Delete this rental enquiry?</h2>
            <p id="delete-rental-enquiry-desc">
              This action permanently removes the enquiry record from the database.
            </p>
          </div>
        </header>

        <div className="admin-delete-preview-box">
          <div className="admin-delete-meta">
            <strong>{enquiry.name}</strong>
            <span>{enquiry.phone}</span>
            <span className="admin-delete-url-hint">
              Requirement: {enquiry.configuration}
              {locationInfo ? ` · ${locationInfo}` : ""}
              {enquiry.budget ? ` · ${enquiry.budget}` : ""}
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
            {isDeleting ? "Deleting..." : "Delete Enquiry"}
          </button>
        </footer>
      </div>
    </div>
  );
}
