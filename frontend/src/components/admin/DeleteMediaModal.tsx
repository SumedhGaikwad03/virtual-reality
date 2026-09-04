/*
 * PURPOSE:
 * Accessible confirmation modal dialog for media deletion.
 *
 * FLOW:
 * Admin Media Pages -> DeleteMediaModal -> deleteMedia API.
 *
 * RESPONSIBILITY:
 * Prevents accidental one-click deletion of media assets by providing clear confirmation,
 * asset details preview, deletion progress state, and error feedback.
 */

import { useEffect, type ReactNode } from "react";
import type { AdminMedia } from "../../types/admin-media";

type DeleteMediaModalProps = {
  media: AdminMedia | null;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function DeleteMediaModal({
  media,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeleteMediaModalProps) {
  useEffect(() => {
    if (!media) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [media, isDeleting, onCancel]);

  if (!media) return null;

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
      aria-labelledby="delete-media-title"
      aria-describedby="delete-media-desc"
    >
      <div className="admin-card admin-delete-modal-card">
        <header className="admin-delete-modal-header">
          <div className="admin-delete-modal-icon" aria-hidden="true">
            ⚠
          </div>
          <div>
            <h2 id="delete-media-title">Delete this media?</h2>
            <p id="delete-media-desc">
              This action permanently removes the media from the platform. If the media is currently used by another part of the site, deletion may be blocked.
            </p>
          </div>
        </header>

        <div className="admin-delete-preview-box">
          <div className="admin-delete-thumb-wrapper">
            {media.type === "IMAGE" ? (
              <img
                src={media.thumbnailUrl ?? media.url}
                alt={media.altText ?? media.title ?? "Media thumbnail"}
                className="admin-delete-thumb-img"
              />
            ) : media.type === "VIDEO" ? (
              <div className="admin-delete-thumb-placeholder">🎬 Video</div>
            ) : (
              <div className="admin-delete-thumb-placeholder">📄 Document</div>
            )}
          </div>
          <div className="admin-delete-meta">
            <strong>{media.title || media.slot || "Untitled Media"}</strong>
            <span>{media.category} · {media.type}</span>
            <span className="admin-delete-url-hint">{media.url}</span>
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
            {isDeleting ? "Deleting..." : "Delete Media"}
          </button>
        </footer>
      </div>
    </div>
  );
}
