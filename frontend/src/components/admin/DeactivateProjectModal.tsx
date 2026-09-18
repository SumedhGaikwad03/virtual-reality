/*
 * PURPOSE:
 * Confirmation modal for deactivating a project.
 *
 * FLOW:
 * ProjectsPage / ProjectFormPage -> DeactivateProjectModal -> updateProject API.
 *
 * RESPONSIBILITY:
 * Confirms that deactivating a project removes the project and its configurations from public visibility
 * while preserving all existing data in the database.
 */

import { useEffect } from "react";
import type { AdminProject } from "../../types/admin-project";

type DeactivateProjectModalProps = {
  project: AdminProject;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  error: string | null;
};

export function DeactivateProjectModal({
  project,
  onClose,
  onConfirm,
  isSubmitting,
  error,
}: DeactivateProjectModalProps) {
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
      aria-labelledby="deactivate-project-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 id="deactivate-project-title">Deactivate this project?</h2>
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
            Are you sure you want to deactivate <strong>{project.name}</strong>?
          </p>

          <div className="admin-warning-callout">
            <p>
              This will remove the project and its configurations from public visibility. Existing data will be preserved.
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
              {isSubmitting ? "Deactivating..." : "Deactivate Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
