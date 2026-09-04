/*
 * PURPOSE:
 * Confirmation modal for deactivating an administrator account.
 *
 * FLOW:
 * AdminAccountsPage -> DeactivateAdminModal -> updateAdminAccountStatus API.
 *
 * RESPONSIBILITY:
 * Explain loss of access, confirm that account history is preserved and reversible,
 * and handle confirmation safely.
 */

import { useEffect } from "react";
import type { AdminAccount } from "../../auth/types";

type DeactivateAdminModalProps = {
  account: AdminAccount;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  error: string | null;
};

export function DeactivateAdminModal({
  account,
  onClose,
  onConfirm,
  isSubmitting,
  error,
}: DeactivateAdminModalProps) {
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
      aria-labelledby="deactivate-admin-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 id="deactivate-admin-title">Deactivate Administrator</h2>
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
            Are you sure you want to deactivate the administrator account for{" "}
            <strong>{account.name ? `${account.name} (${account.email})` : account.email}</strong>?
          </p>

          <div className="admin-warning-callout">
            <p><strong>Important notes:</strong></p>
            <ul>
              <li>This administrator will immediately lose access to the admin platform.</li>
              <li>Existing session tokens will be rejected.</li>
              <li>This does <em>not</em> delete the account; all historical records remain intact.</li>
              <li>You can reactivate this account at any time from this page.</li>
            </ul>
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
              {isSubmitting ? "Deactivating..." : "Deactivate Administrator"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
