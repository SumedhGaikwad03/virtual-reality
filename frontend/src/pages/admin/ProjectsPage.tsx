/*
 * PURPOSE:
 * Admin projects list page.
 *
 * FLOW:
 * Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Fetches and renders the list of all projects (Draft and Published) for admin management,
 * and provides navigation to create a new project or open its contextual workspace.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getProjects, updateProject } from "../../api/admin-projects";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeactivateProjectModal } from "../../components/admin/DeactivateProjectModal";
import type { AdminProject, ProjectStatus } from "../../types/admin-project";

export { ProjectFormPage } from "./ProjectFormPage";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === 400) return "Please check the project details and try again.";
  if (error.status === 404) return "Project not found.";
  if (error.status === 409) return "That project slug is already in use.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return "Unable to load projects. Please try again.";
}

function formatLifecycleStatus(status: ProjectStatus): string {
  switch (status) {
    case "READY_TO_MOVE":
      return "Ready to Move";
    case "ONGOING":
      return "Ongoing";
    case "UPCOMING":
      return "Upcoming";
    case "COMPLETED":
      return "Completed";
    case "SOLD_OUT":
      return "Sold Out";
    default:
      return status;
  }
}

export function ProjectsPage() {
  const navigate = useNavigate();

  return (
    <ProjectListPage
      onAdd={() => navigate("/admin/projects/new")}
    />
  );
}

function ProjectListPage({ onAdd }: { onAdd: () => void }) {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deactivatingProject, setDeactivatingProject] = useState<AdminProject | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  function loadProjects() {
    return getProjects()
      .then((response) => {
        setProjects(response.data);
      })
      .catch((requestError: unknown) => {
        setError(errorMessage(requestError));
      });
  }

  useEffect(() => {
    setIsLoading(true);
    loadProjects().finally(() => {
      setIsLoading(false);
    });
  }, []);

  async function handleActivate(project: AdminProject) {
    setActionError(null);
    setSuccessMessage(null);
    setIsUpdatingId(project.id);

    try {
      const response = await updateProject(project.id, { publishStatus: "PUBLISHED" });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? response.data : p)),
      );
      setSuccessMessage(`Project "${project.name}" activated successfully.`);
    } catch (requestError) {
      setActionError(errorMessage(requestError));
    } finally {
      setIsUpdatingId(null);
    }
  }

  async function handleConfirmDeactivate() {
    if (!deactivatingProject) return;

    setActionError(null);
    setSuccessMessage(null);
    setIsUpdatingId(deactivatingProject.id);

    try {
      const response = await updateProject(deactivatingProject.id, { publishStatus: "DRAFT" });
      setProjects((prev) =>
        prev.map((p) => (p.id === deactivatingProject.id ? response.data : p)),
      );
      setSuccessMessage(`Project "${deactivatingProject.name}" deactivated.`);
      setDeactivatingProject(null);
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
          <h1>Projects</h1>
          <p>Manage the projects shown on the public site.</p>
        </div>
        <button className="admin-action admin-action--primary" type="button" onClick={onAdd}>Add Project</button>
      </div>

      {isLoading && <p>Loading projects...</p>}
      {error && <p role="alert">{error}</p>}
      {actionError && <div className="admin-alert admin-alert-error" role="alert" style={{ marginBottom: "1rem" }}>{actionError}</div>}
      {successMessage && <div className="admin-alert admin-alert-success" role="status" style={{ marginBottom: "1rem" }}>{successMessage}</div>}

      {!isLoading && !error && projects.length === 0 && (
        <section className="admin-card"><p>No projects found.</p></section>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <div className="admin-card admin-project-list">
          {projects.map((project) => {
            const isActive = project.publishStatus === "PUBLISHED";
            const isParentDeveloperInactive = project.developer?.publishStatus === "DRAFT";
            const isMutating = isUpdatingId === project.id;

            return (
              <article className="admin-project-row" key={project.id}>
                <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <h2>{project.name}</h2>
                    {isActive ? (
                      isParentDeveloperInactive ? (
                        <span className="admin-badge admin-badge--warning" title="Developer is inactive; this project is currently not visible publicly.">
                          Active (Developer Inactive)
                        </span>
                      ) : (
                        <span className="admin-badge admin-badge--active">Active</span>
                      )
                    ) : (
                      <span className="admin-badge admin-badge--inactive">Inactive</span>
                    )}
                    {project.featured && (
                      <span className="admin-badge admin-badge--featured">Featured</span>
                    )}
                  </div>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                    {project.slug} · Developer: <strong>{project.developer.name}</strong> · Location: {project.locationName}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "var(--admin-text-muted)" }}>Lifecycle: </span>
                    <strong>{formatLifecycleStatus(project.status)}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-text-muted)" }}>Publication: </span>
                    <strong style={{ color: isActive ? "var(--admin-success-text, #15803d)" : "var(--admin-text-muted)" }}>
                      {isActive ? "Active" : "Inactive"}
                    </strong>
                  </div>
                </div>

                <div className="admin-project-row-actions" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {isActive ? (
                    <button
                      type="button"
                      className="admin-action admin-action--secondary admin-action--danger"
                      onClick={() => setDeactivatingProject(project)}
                      disabled={isMutating}
                    >
                      {isMutating ? "Updating..." : "Deactivate"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-action admin-action--secondary"
                      onClick={() => handleActivate(project)}
                      disabled={isMutating}
                    >
                      {isMutating ? "Updating..." : "Activate"}
                    </button>
                  )}

                  <Link className="admin-action admin-action--secondary" to={`/admin/projects/${project.id}`}>
                    Open Workspace
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {deactivatingProject && (
        <DeactivateProjectModal
          project={deactivatingProject}
          onClose={() => setDeactivatingProject(null)}
          onConfirm={handleConfirmDeactivate}
          isSubmitting={isUpdatingId === deactivatingProject.id}
          error={actionError}
        />
      )}
    </AdminLayout>
  );
}
