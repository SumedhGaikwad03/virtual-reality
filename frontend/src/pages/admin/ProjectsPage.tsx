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
import { getProjects } from "../../api/admin-projects";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { AdminProject } from "../../types/admin-project";

export { ProjectFormPage } from "./ProjectFormPage";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === 400) return "Please check the project details and try again.";
  if (error.status === 404) return "Project not found.";
  if (error.status === 409) return "That project slug is already in use.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return "Unable to load projects. Please try again.";
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

  useEffect(() => {
    let active = true;
    getProjects()
      .then((response) => {
        if (active) setProjects(response.data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
      {!isLoading && !error && projects.length === 0 && (
        <section className="admin-card"><p>No projects found.</p></section>
      )}
      {!isLoading && !error && projects.length > 0 && (
        <div className="admin-card admin-project-list">
          {projects.map((project) => (
            <article className="admin-project-row" key={project.id}>
              <div>
                <h2>{project.name}</h2>
                <p>{project.slug}</p>
              </div>
              <p>{project.developer.name}</p>
              <p>{project.locationName}</p>
              <p>
                {project.status}
                {project.featured ? " · Featured" : ""} ·{" "}
                {project.publishStatus === "PUBLISHED" ? "Published" : "Draft"}
              </p>
              <Link className="admin-action admin-action--secondary" to={`/admin/projects/${project.id}`}>Open Workspace</Link>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
