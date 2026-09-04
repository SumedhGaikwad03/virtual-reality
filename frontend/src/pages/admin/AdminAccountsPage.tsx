/*
 * PURPOSE:
 * Administrator accounts management page.
 *
 * FLOW:
 * AdminLayout -> AdminAccountsPage -> getAdminAccounts, update status, edit, change password.
 *
 * RESPONSIBILITY:
 * Render the list of platform administrators, enforce self-deactivation and last-active
 * account protections, and coordinate profile/password modal workflows.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminAccounts,
  updateAdminAccountStatus,
} from "../../api/admin-auth";
import { AdminApiError } from "../../api/admin-client";
import { useAuth } from "../../auth/AuthContext";
import type { AdminAccount } from "../../auth/types";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ChangeAdminPasswordModal } from "../../components/admin/ChangeAdminPasswordModal";
import { DeactivateAdminModal } from "../../components/admin/DeactivateAdminModal";
import { EditAdminModal } from "../../components/admin/EditAdminModal";

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function AdminAccountsPage() {
  const { admin: currentAdmin } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [passwordTargetAccount, setPasswordTargetAccount] = useState<AdminAccount | null>(null);
  const [deactivatingAccount, setDeactivatingAccount] = useState<AdminAccount | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  async function loadAccounts() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAdminAccounts();
      setAccounts(response.data);
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to load administrator accounts.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  const activeCount = accounts.filter((acc) => acc.isActive).length;

  async function handleConfirmDeactivate() {
    if (!deactivatingAccount) return;

    setIsDeactivating(true);
    setDeactivateError(null);

    try {
      const response = await updateAdminAccountStatus(deactivatingAccount.id, false);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === deactivatingAccount.id ? response.data : acc)),
      );
      setDeactivatingAccount(null);
      setSuccessMessage(`Administrator ${response.data.name || response.data.email} deactivated.`);
    } catch (requestError) {
      if (requestError instanceof AdminApiError && requestError.status === 400) {
        setDeactivateError(requestError.message || "Cannot deactivate this administrator.");
      } else if (requestError instanceof Error) {
        setDeactivateError(requestError.message);
      } else {
        setDeactivateError("Failed to deactivate administrator. Please try again.");
      }
    } finally {
      setIsDeactivating(false);
    }
  }

  async function handleActivate(account: AdminAccount) {
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await updateAdminAccountStatus(account.id, true);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === account.id ? response.data : acc)),
      );
      setSuccessMessage(`Administrator ${response.data.name || response.data.email} activated.`);
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to activate administrator.");
      }
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Administrator Accounts</h1>
          <p>Manage internal administrative accounts, roles, credentials, and platform access.</p>
        </div>
        <Link className="admin-action admin-action--primary" to="/admin/accounts/new">
          + Create Admin
        </Link>
      </div>

      {successMessage && (
        <div className="admin-notification-feedback admin-notification-feedback--success" role="status">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="admin-notification-feedback admin-notification-feedback--error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <p>Loading administrator accounts...</p>
      ) : accounts.length === 0 ? (
        <section className="admin-card">
          <p>No administrator accounts found.</p>
        </section>
      ) : (
        <div className="admin-card admin-accounts-table-wrapper">
          <div className="admin-accounts-list">
            {accounts.map((account) => {
              const isSelf = currentAdmin?.id === account.id;
              const isLastActive = account.isActive && activeCount <= 1;

              return (
                <article
                  key={account.id}
                  className={`admin-account-row ${!account.isActive ? "is-inactive" : ""}`}
                >
                  <div className="admin-account-identity">
                    <h2>
                      {account.name || "Administrator"}
                      <span className={`admin-badge ${account.role === "FOUNDER" ? "admin-badge--primary" : "admin-badge--neutral"}`} style={{ marginLeft: "0.5rem" }}>
                        {account.role}
                      </span>
                      {isSelf && (
                        <span className="admin-badge admin-badge--neutral admin-self-badge">
                          You
                        </span>
                      )}
                    </h2>
                    <p className="admin-account-email">{account.email}</p>
                  </div>

                  <div className="admin-account-status-col">
                    <span
                      className={`admin-badge ${
                        account.isActive ? "admin-badge--success" : "admin-badge--neutral"
                      }`}
                    >
                      {account.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="admin-account-date-col">
                    <p className="admin-account-created-label">Created</p>
                    <p>{formatDate(account.createdAt)}</p>
                  </div>

                  <div className="admin-account-actions">
                    <button
                      type="button"
                      className="admin-action admin-action--secondary"
                      onClick={() => setEditingAccount(account)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-action admin-action--secondary"
                      onClick={() => setPasswordTargetAccount(account)}
                    >
                      {isSelf ? "Change Password" : "Reset Password"}
                    </button>

                    {account.isActive ? (
                      <button
                        type="button"
                        className="admin-action admin-action--danger"
                        disabled={isSelf || isLastActive}
                        title={
                          isSelf
                            ? "You cannot deactivate your own account"
                            : isLastActive
                              ? "Cannot deactivate the last active administrator"
                              : "Deactivate account"
                        }
                        onClick={() => {
                          setDeactivateError(null);
                          setDeactivatingAccount(account);
                        }}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-action admin-action--success"
                        onClick={() => handleActivate(account)}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingAccount && (
        <EditAdminModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSuccess={(updated) => {
            setAccounts((prev) =>
              prev.map((acc) => (acc.id === updated.id ? updated : acc)),
            );
            setEditingAccount(null);
            setSuccessMessage(`Profile for ${updated.name || updated.email} updated.`);
          }}
        />
      )}

      {/* Change Password Modal */}
      {passwordTargetAccount && (
        <ChangeAdminPasswordModal
          account={passwordTargetAccount}
          isSelf={currentAdmin?.id === passwordTargetAccount.id}
          onClose={() => setPasswordTargetAccount(null)}
          onSuccess={(msg) => {
            setPasswordTargetAccount(null);
            setSuccessMessage(msg);
          }}
        />
      )}

      {/* Deactivate Modal */}
      {deactivatingAccount && (
        <DeactivateAdminModal
          account={deactivatingAccount}
          onClose={() => {
            setDeactivatingAccount(null);
            setDeactivateError(null);
          }}
          onConfirm={handleConfirmDeactivate}
          isSubmitting={isDeactivating}
          error={deactivateError}
        />
      )}
    </AdminLayout>
  );
}
