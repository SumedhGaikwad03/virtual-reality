/*
 * PURPOSE:
 * Admin developers list page.
 *
 * FLOW:
 * Admin Developer Management Flow
 *
 * RESPONSIBILITY:
 * Fetches and renders the list of all developers (Draft and Published) for admin management,
 * and provides navigation to create a new developer or edit an existing one.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getDevelopers, updateDeveloper } from "../../api/admin-developers";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeactivateDeveloperModal } from "../../components/admin/DeactivateDeveloperModal";
import type { AdminDeveloper } from "../../types/admin-developer";

export { DeveloperFormPage } from "./DeveloperFormPage";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.status === 400) {
    return "Please check the developer details and try again.";
  }

  if (error.status === 404) {
    return "Developer not found.";
  }

  if (error.status === 409) {
    return "That developer slug is already in use.";
  }

  if (error.status === null) {
    return "Unable to reach the server. Please try again.";
  }

  return "The server could not complete that request. Please try again.";
}

export function DevelopersPage() {
  const navigate = useNavigate();

  return (
    <DeveloperListPage
      onAdd={() => navigate("/admin/developers/new")}
    />
  );
}

function DeveloperListPage({
  onAdd,
}: {
  onAdd: () => void;
}) {
  const [developers, setDevelopers] = useState<AdminDeveloper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deactivatingDeveloper, setDeactivatingDeveloper] = useState<AdminDeveloper | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  function loadDevelopers() {
    return getDevelopers()
      .then((response) => {
        setDevelopers(response.data);
      })
      .catch((requestError: unknown) => {
        setError(errorMessage(requestError));
      });
  }

  useEffect(() => {
    setIsLoading(true);
    loadDevelopers().finally(() => {
      setIsLoading(false);
    });
  }, []);

  async function handleActivate(developer: AdminDeveloper) {
    setActionError(null);
    setSuccessMessage(null);
    setIsUpdatingId(developer.id);

    try {
      const response = await updateDeveloper(developer.id, { publishStatus: "PUBLISHED" });
      setDevelopers((prev) =>
        prev.map((d) => (d.id === developer.id ? response.data : d)),
      );
      setSuccessMessage(`Developer "${developer.name}" activated successfully.`);
    } catch (requestError) {
      setActionError(errorMessage(requestError));
    } finally {
      setIsUpdatingId(null);
    }
  }

  async function handleConfirmDeactivate() {
    if (!deactivatingDeveloper) return;

    setActionError(null);
    setSuccessMessage(null);
    setIsUpdatingId(deactivatingDeveloper.id);

    try {
      const response = await updateDeveloper(deactivatingDeveloper.id, { publishStatus: "DRAFT" });
      setDevelopers((prev) =>
        prev.map((d) => (d.id === deactivatingDeveloper.id ? response.data : d)),
      );
      setSuccessMessage(`Developer "${deactivatingDeveloper.name}" deactivated.`);
      setDeactivatingDeveloper(null);
    } catch (requestError) {
      setActionError(errorMessage(requestError));
    } finally {
      setIsUpdatingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Developers</h1>
          <p>
            Manage the developers shown on the public site.
          </p>
        </div>

        <button className="admin-action admin-action--primary" type="button" onClick={onAdd}>
          Add Developer
        </button>
      </div>

      {isLoading && <p>Loading developers...</p>}

      {error && <p role="alert">{error}</p>}
      {actionError && <div className="admin-alert admin-alert-error" role="alert" style={{ marginBottom: "1rem" }}>{actionError}</div>}
      {successMessage && <div className="admin-alert admin-alert-success" role="status" style={{ marginBottom: "1rem" }}>{successMessage}</div>}

      {!isLoading &&
        !error &&
        developers.length === 0 && (
          <section className="admin-card">
            <p>No developers have been added yet.</p>
          </section>
        )}

      {!isLoading &&
        !error &&
        developers.length > 0 && (
          <div className="admin-card admin-developer-list">
            {developers.map((developer) => {
              const isActive = developer.publishStatus === "PUBLISHED";
              const isMutating = isUpdatingId === developer.id;

              return (
                <article
                  className="admin-developer-row"
                  key={developer.id}
                >
                  {developer.logoUrl ? (
                    <img
                      src={developer.logoUrl}
                      alt=""
                      className="admin-developer-logo"
                    />
                  ) : (
                    <div className="admin-developer-logo admin-developer-logo-fallback">
                      {developer.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <h2>{developer.name}</h2>
                      <span className={`admin-badge ${isActive ? "admin-badge--active" : "admin-badge--inactive"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                      {developer.slug} · Publication: {isActive ? "Active" : "Inactive"}
                    </p>
                  </div>

                  <div className="admin-developer-actions" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {isActive ? (
                      <button
                        type="button"
                        className="admin-action admin-action--secondary admin-action--danger"
                        onClick={() => setDeactivatingDeveloper(developer)}
                        disabled={isMutating}
                      >
                        {isMutating ? "Updating..." : "Deactivate"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-action admin-action--secondary"
                        onClick={() => handleActivate(developer)}
                        disabled={isMutating}
                      >
                        {isMutating ? "Updating..." : "Activate"}
                      </button>
                    )}

                    <Link
                      className="admin-action admin-action--secondary"
                      to={`/admin/developers/${developer.id}`}
                    >
                      View / Edit
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      {deactivatingDeveloper && (
        <DeactivateDeveloperModal
          developer={deactivatingDeveloper}
          onClose={() => setDeactivatingDeveloper(null)}
          onConfirm={handleConfirmDeactivate}
          isSubmitting={isUpdatingId === deactivatingDeveloper.id}
          error={actionError}
        />
      )}
    </AdminLayout>
  );
}
