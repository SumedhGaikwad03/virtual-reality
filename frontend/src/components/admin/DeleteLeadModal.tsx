/*
 * PURPOSE:
 * Confirmation modal dialog for lead deletion.
 *
 * FLOW:
 * LeadsPage / LeadDetailPage -> DeleteLeadModal -> deleteLead API.
 *
 * RESPONSIBILITY:
 * Prevents accidental one-click deletion of lead records with clear confirmation,
 * lead details preview, deletion progress state, and error feedback.
 */

import { useEffect } from "react";
import type { AdminLead } from "../../types/admin-lead";

type DeleteLeadModalProps = {
  lead: AdminLead | null;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function DeleteLeadModal({
  lead,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeleteLeadModalProps) {
  useEffect(() => {
    if (!lead) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lead, isDeleting, onCancel]);

  if (!lead) return null;

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
      aria-labelledby="delete-lead-title"
      aria-describedby="delete-lead-desc"
    >
      <div className="admin-card admin-delete-modal-card">
        <header className="admin-delete-modal-header">
          <div className="admin-delete-modal-icon" aria-hidden="true">
            ⚠
          </div>
          <div>
            <h2 id="delete-lead-title">Delete this lead?</h2>
            <p id="delete-lead-desc">
              This action permanently removes the lead record from the database.
            </p>
          </div>
        </header>

        <div className="admin-delete-preview-box">
          <div className="admin-delete-meta">
            <strong>{lead.name}</strong>
            <span>{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</span>
            <span className="admin-delete-url-hint">
              {lead.project?.name
                ? `Project: ${lead.project.name}`
                : lead.developer?.name
                  ? `Developer: ${lead.developer.name}`
                  : "General enquiry"}
              {lead.configuration?.name ? ` (${lead.configuration.name})` : ""}
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
            {isDeleting ? "Deleting..." : "Delete Lead"}
          </button>
        </footer>
      </div>
    </div>
  );
}
