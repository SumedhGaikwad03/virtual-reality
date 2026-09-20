/*
 * PURPOSE:
 * Founder-only modal dialog to reassign lead ownership to an active administrator.
 *
 * FLOW:
 * LeadDetailPage -> ReassignLeadOwnerModal -> PATCH /api/admin/leads/:id/owner -> Updated AdminLead.
 *
 * RESPONSIBILITY:
 * - Fetches active administrators from getAdminAccounts().
 * - Displays current owner and selection list of eligible active administrators.
 * - Submits owner reassignment to the server-enforced Founder endpoint.
 * - Emits updated lead without reloading the entire application.
 */

import { useState, useEffect, type FormEvent } from "react";
import { getAdminAccounts } from "../../api/admin-auth";
import { reassignLeadOwner } from "../../api/admin-leads";
import { AdminApiError } from "../../api/admin-client";
import type { AdminAccount } from "../../auth/types";
import type { AdminLead } from "../../types/admin-lead";

type ReassignLeadOwnerModalProps = {
  isOpen: boolean;
  lead: AdminLead | null;
  onClose: () => void;
  onSuccess: (updatedLead: AdminLead) => void;
};

function ownerLabel(lead: AdminLead): string {
  if (lead.owner) {
    return lead.owner.name?.trim() || lead.owner.email;
  }
  return "Founder";
}

export function ReassignLeadOwnerModal({
  isOpen,
  lead,
  onClose,
  onSuccess,
}: ReassignLeadOwnerModalProps) {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !lead) return;

    let active = true;
    setIsLoadingAdmins(true);
    setError(null);
    setIsSubmitting(false);
    setSelectedOwnerId(lead.ownerId || lead.owner?.id || "");

    getAdminAccounts()
      .then((res) => {
        if (!active) return;
        const activeAdmins = (res.data || []).filter((account) => account.isActive);
        setAdmins(activeAdmins);
        if (!lead.ownerId && activeAdmins.length > 0 && activeAdmins[0]) {
          setSelectedOwnerId(activeAdmins[0].id);
        }
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof AdminApiError && err.status === 403) {
          setError("Founder privileges required to reassign leads.");
        } else {
          setError("Failed to load administrators. Please try again.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingAdmins(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, lead]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !lead) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!lead || !selectedOwnerId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await reassignLeadOwner(lead.id, selectedOwnerId);
      onSuccess(response.data);
      onClose();
    } catch (requestError: unknown) {
      if (requestError instanceof AdminApiError) {
        if (requestError.status === 403) {
          setError("Only Founder can reassign lead ownership.");
        } else if (requestError.status === 400) {
          setError("Selected administrator is invalid or inactive.");
        } else {
          setError("Failed to reassign lead. Please try again.");
        }
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to reassign lead. Please try again.");
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
      aria-labelledby="reassign-owner-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="admin-modal-content" style={{ maxWidth: "520px" }}>
        <div className="admin-modal-header">
          <h2 id="reassign-owner-title">Change Lead Owner</h2>
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
            <div className="admin-alert-banner admin-alert-banner--error" role="alert">
              ⚠ {error}
            </div>
          )}

          <div
            style={{
              padding: "0.875rem 1rem",
              background: "var(--admin-surface-subtle, #f6f6f3)",
              border: "1px solid var(--admin-border)",
              borderRadius: "0.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Current Owner
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--admin-text)", marginTop: "0.2rem" }}>
              {ownerLabel(lead)}
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--admin-text)",
                marginBottom: "0.6rem",
              }}
            >
              Assign to
            </label>

            {isLoadingAdmins && <p style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)" }}>Loading active administrators...</p>}

            {!isLoadingAdmins && admins.length === 0 && (
              <p style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)" }}>No active administrators available.</p>
            )}

            {!isLoadingAdmins && admins.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  maxHeight: "260px",
                  overflowY: "auto",
                }}
              >
                {admins.map((admin) => (
                  <label
                    key={admin.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      background: selectedOwnerId === admin.id ? "var(--admin-primary-soft, rgba(24, 56, 46, 0.08))" : "var(--admin-surface)",
                      border: `1px solid ${selectedOwnerId === admin.id ? "var(--admin-primary, #18382E)" : "var(--admin-border)"}`,
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="radio"
                      name="leadOwner"
                      value={admin.id}
                      checked={selectedOwnerId === admin.id}
                      onChange={() => setSelectedOwnerId(admin.id)}
                      disabled={isSubmitting}
                      style={{ accentColor: "var(--admin-primary, #18382E)", width: "1.1rem", height: "1.1rem" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <strong style={{ fontSize: "0.925rem", color: "var(--admin-text)" }}>
                          {admin.name || admin.email}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            padding: "0.15rem 0.45rem",
                            borderRadius: "9999px",
                            background: admin.role === "FOUNDER" ? "var(--admin-primary-soft, rgba(24, 56, 46, 0.1))" : "rgba(0, 0, 0, 0.06)",
                            color: admin.role === "FOUNDER" ? "var(--admin-primary, #18382E)" : "var(--admin-text-muted)",
                          }}
                        >
                          {admin.role}
                        </span>
                      </div>
                      {admin.name && (
                        <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginTop: "0.15rem" }}>
                          {admin.email}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="admin-modal-actions" style={{ marginTop: "1.5rem" }}>
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
              disabled={isSubmitting || isLoadingAdmins || !selectedOwnerId || selectedOwnerId === lead.ownerId}
            >
              {isSubmitting ? "Assigning..." : "Assign Owner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
