/*
 * PURPOSE:
 * Modal dialog for changing own password or performing an administrative password reset.
 *
 * FLOW:
 * AdminAccountsPage -> ChangeAdminPasswordModal -> changeAdminAccountPassword API.
 *
 * RESPONSIBILITY:
 * Enforce password policy, verify confirmation match, toggle password visibility,
 * and submit securely without logging or leaking credentials.
 */

import { useState, useEffect, type FormEvent } from "react";
import { changeAdminAccountPassword } from "../../api/admin-auth";
import { AdminApiError } from "../../api/admin-client";
import type { AdminAccount } from "../../auth/types";

type ChangeAdminPasswordModalProps = {
  account: AdminAccount;
  isSelf: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function ChangeAdminPasswordModal({
  account,
  isSelf,
  onClose,
  onSuccess,
}: ChangeAdminPasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (isSelf && !currentPassword) {
      setError("Current password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await changeAdminAccountPassword(account.id, {
        currentPassword: isSelf ? currentPassword : undefined,
        newPassword,
      });
      onSuccess(response.data.message || "Password updated successfully.");
    } catch (requestError) {
      if (requestError instanceof AdminApiError && requestError.status === 400) {
        setError(requestError.message || "Current password is incorrect or password requirements not met.");
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 id="change-password-title">
            {isSelf ? "Change Your Password" : `Reset Password for ${account.name || account.email}`}
          </h2>
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

        <form onSubmit={handleSubmit} className="admin-modal-body">
          {error && (
            <div className="admin-notification-feedback admin-notification-feedback--error" role="alert">
              {error}
            </div>
          )}

          {isSelf && (
            <div className="admin-form-group">
              <label htmlFor="current-password">Current Password <span className="admin-required">*</span></label>
              <input
                id="current-password"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>
          )}

          <div className="admin-form-group">
            <label htmlFor="new-password">New Password (minimum 8 characters) <span className="admin-required">*</span></label>
            <input
              id="new-password"
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="confirm-password">Confirm New Password <span className="admin-required">*</span></label>
            <input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div className="admin-checkbox-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                disabled={isSubmitting}
              />
              Show passwords
            </label>
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
              type="submit"
              className="admin-action admin-action--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Password..." : isSelf ? "Update Password" : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
