/*
 * PURPOSE:
 * Modal dialog to edit an administrator's profile name and email address.
 *
 * FLOW:
 * AdminAccountsPage -> EditAdminModal -> updateAdminAccount API.
 *
 * RESPONSIBILITY:
 * Validate inputs, provide feedback, prevent duplicate submissions, and emit the updated administrator.
 */

import { useState, useEffect, type FormEvent } from "react";
import { updateAdminAccount } from "../../api/admin-auth";
import { AdminApiError } from "../../api/admin-client";
import type { AdminAccount } from "../../auth/types";

type EditAdminModalProps = {
  account: AdminAccount;
  onClose: () => void;
  onSuccess: (updated: AdminAccount) => void;
};

export function EditAdminModal({
  account,
  onClose,
  onSuccess,
}: EditAdminModalProps) {
  const [name, setName] = useState(account.name ?? "");
  const [email, setEmail] = useState(account.email);
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
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await updateAdminAccount(account.id, {
        name: trimmedName || null,
        email: trimmedEmail,
      });
      onSuccess(response.data);
    } catch (requestError) {
      if (requestError instanceof AdminApiError && requestError.status === 409) {
        setError("An administrator with this email already exists.");
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to update administrator profile. Please try again.");
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
      aria-labelledby="edit-admin-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 id="edit-admin-title">Edit Administrator Profile</h2>
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

          <div className="admin-form-group">
            <label htmlFor="edit-admin-name">Full Name</label>
            <input
              id="edit-admin-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dipankar Jagtap"
              disabled={isSubmitting}
              maxLength={255}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="edit-admin-email">Email Address <span className="admin-required">*</span></label>
            <input
              id="edit-admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              maxLength={255}
            />
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
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
