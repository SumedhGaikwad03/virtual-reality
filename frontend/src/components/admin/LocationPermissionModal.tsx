/*
 * PURPOSE:
 * Explanatory modal dialog for requesting workspace location access.
 *
 * FLOW:
 * AdminLayout / Location Flow -> LocationPermissionModal -> navigator.geolocation.getCurrentPosition.
 *
 * RESPONSIBILITY:
 * - Restrained, non-blocking explanation consistent with Admin design system.
 * - Explains that only the single latest snapshot and update time are recorded.
 * - Provides explicit "Allow Location Access" (triggers browser prompt) and "Not Now" actions.
 * - Contains no maps, no coordinates, and no intrusive styling.
 */

import { useEffect } from "react";

type LocationPermissionModalProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onAllow: () => void;
  onDismiss: () => void;
};

export function LocationPermissionModal({
  isOpen,
  isSubmitting = false,
  onAllow,
  onDismiss,
}: LocationPermissionModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onDismiss();
        }
      }}
    >
      <div className="admin-modal-content" style={{ maxWidth: "26rem" }}>
        <div className="admin-modal-header">
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--admin-text-muted)",
              }}
            >
              LOCATION ACCESS
            </p>
            <h2 id="location-modal-title" style={{ marginTop: "0.25rem", fontSize: "1.15rem" }}>
              Keep your workspace location updated
            </h2>
          </div>
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={onDismiss}
            disabled={isSubmitting}
            aria-label="Dismiss dialog"
          >
            ✕
          </button>
        </div>

        <div className="admin-modal-body" style={{ gap: "0.85rem" }}>
          <p className="admin-modal-text">
            Allow location access so your workspace can keep your latest known location updated.
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "0.82rem",
              color: "var(--admin-text-muted)",
              fontStyle: "italic",
            }}
          >
            Only your latest location and update time are saved.
          </p>

          <div className="admin-modal-actions" style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              className="admin-action admin-action--secondary"
              onClick={onDismiss}
              disabled={isSubmitting}
            >
              Not Now
            </button>
            <button
              type="button"
              className="admin-action admin-action--primary"
              onClick={onAllow}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Allow Location Access"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
