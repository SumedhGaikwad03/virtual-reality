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
import { getDevelopers } from "../../api/admin-developers";
import { AdminLayout } from "../../components/admin/AdminLayout";
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

  useEffect(() => {
    let active = true;

    getDevelopers()
      .then((response) => {
        if (active) {
          setDevelopers(response.data);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(errorMessage(requestError));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Developers</h1>
          <p>
            Manage the developers shown on the public site.
          </p>
        </div>

        <button type="button" onClick={onAdd}>
          Add Developer
        </button>
      </div>

      {isLoading && <p>Loading developers...</p>}

      {error && <p role="alert">{error}</p>}

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
            {developers.map((developer) => (
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

                <div>
                  <h2>{developer.name}</h2>
                  <p>
                    {developer.slug} ·{" "}
                    {developer.publishStatus === "PUBLISHED"
                      ? "Published"
                      : "Draft"}
                  </p>
                </div>

                <Link
                  to={`/admin/developers/${developer.id}`}
                >
                  View / Edit
                </Link>
              </article>
            ))}
          </div>
        )}
    </AdminLayout>
  );
}