/*
 * PURPOSE:
 * Confirmation modal dialog for cancelling or deleting a property visit.
 *
 * FLOW:
 * VisitsPage -> CancelVisitModal -> cancelVisitSchedule / deleteVisit API.
 *
 * RESPONSIBILITY:
 * Prevents accidental deletion of visit records.
 * Provides explicit choice between:
 * 1. Cancelling the visit schedule (removes from Visits workspace, preserves customer lead record in Lead Manager).
 * 2. Permanently deleting the record entirely.
 */

import { useEffect, useState } from "react";
import type { AdminLead } from "../../types/admin-lead";

type CancelVisitModalProps = {
  visit: AdminLead | null;
  isProcessing: boolean;
  errorMessage?: string | null;
  onCancelSchedule: () => Promise<void>;
  onDeletePermanently: () => Promise<void>;
  onClose: () => void;
};

export function CancelVisitModal({
  visit,
  isProcessing,
  errorMessage,
  onCancelSchedule,
  onDeletePermanently,
  onClose,
}: CancelVisitModalProps) {
  const [mode, setMode] = useState<"cancel" | "delete">("cancel");

  useEffect(() => {
    if (!visit) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isProcessing) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visit, isProcessing, onClose]);

  if (!visit) return null;

  return (
    <div
      className="admin-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-visit-title"
      aria-describedby="cancel-visit-desc"
    >
      <div className="admin-card admin-delete-modal-card">
        <header className="admin-delete-modal-header">
          <div className="admin-delete-modal-icon" aria-hidden="true">
            📅
          </div>
          <div>
            <h2 id="cancel-visit-title">
              {mode === "cancel" ? "Cancel this visit schedule?" : "Delete record permanently?"}
            </h2>
            <p id="cancel-visit-desc">
              {mode === "cancel"
                ? "This removes the scheduled appointment from the Visits workspace while keeping the customer's contact record intact in Leads."
                : "This permanently removes the lead and visit from the database. This action cannot be undone."}
            </p>
          </div>
        </header>

        <div className="admin-delete-preview-box">
          <div className="admin-delete-meta">
            <strong>{visit.name}</strong>
            <span>
              {visit.phone}
              {visit.email ? ` · ${visit.email}` : ""}
            </span>
            <span>
              Scheduled: <strong>{visit.visitDate || "No date"}</strong>
              {visit.visitTime ? ` (${visit.visitTime})` : ""}
            </span>
            <span className="admin-delete-url-hint">
              {visit.project?.name
                ? `Project: ${visit.project.name}`
                : visit.developer?.name
                  ? `Developer: ${visit.developer.name}`
                  : "General enquiry"}
              {visit.configuration?.name ? ` (${visit.configuration.name})` : ""}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", margin: "1rem 0 0.5rem" }}>
          <button
            type="button"
            className={`admin-action ${mode === "cancel" ? "admin-action--secondary" : "admin-action--utility"}`}
            style={{ flex: 1, fontWeight: mode === "cancel" ? 600 : 400 }}
            onClick={() => setMode("cancel")}
            disabled={isProcessing}
          >
            Cancel Schedule Only
          </button>
          <button
            type="button"
            className={`admin-action ${mode === "delete" ? "admin-action--danger" : "admin-action--utility"}`}
            style={{ flex: 1, fontWeight: mode === "delete" ? 600 : 400 }}
            onClick={() => setMode("delete")}
            disabled={isProcessing}
          >
            Permanent Delete
          </button>
        </div>

        {errorMessage && (
          <div className="admin-alert-banner admin-alert-banner--error" role="alert">
            ⚠ {errorMessage}
          </div>
        )}

        <footer className="admin-delete-modal-actions" style={{ marginTop: "1.25rem" }}>
          <button
            type="button"
            className="admin-action admin-action--secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Back
          </button>
          {mode === "cancel" ? (
            <button
              type="button"
              className="admin-action admin-action--secondary"
              onClick={() => void onCancelSchedule()}
              disabled={isProcessing}
            >
              {isProcessing ? "Updating..." : "Cancel Schedule"}
            </button>
          ) : (
            <button
              type="button"
              className="admin-action admin-action--danger"
              onClick={() => void onDeletePermanently()}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Permanently"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
