/*
 * PURPOSE:
 * Confirmation modal for deactivating a developer.
 *
 * FLOW:
 * DevelopersPage / DeveloperFormPage -> DeactivateDeveloperModal -> updateDeveloper API.
 *
 * RESPONSIBILITY:
 * Confirms that deactivating a developer removes the developer and its projects from public visibility
 * while preserving all existing projects and relational data in the database.
 */

import { useEffect } from "react";
import type { AdminDeveloper } from "../../types/admin-developer";

type DeactivateDeveloperModalProps = {
  developer: AdminDeveloper;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  error: string | null;
};

export function DeactivateDeveloperModal({
  developer,
  onClose,
  onConfirm,
  isSubmitting,
  error,
}: DeactivateDeveloperModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-developer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 id="deactivate-developer-title">Deactivate this developer?</h2>
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          {error && (
            <div className="admin-notification-feedback admin-notification-feedback--error" role="alert">
              {error}
            </div>
          )}

          <p className="admin-modal-text">
            Are you sure you want to deactivate <strong>{developer.name}</strong>?
          </p>

          <div className="admin-warning-callout">
            <p>
              This will remove the developer and its projects from public visibility. Existing projects and data will be preserved.
            </p>
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-action admin-action--secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-action admin-action--danger"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deactivating..." : "Deactivate Developer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
