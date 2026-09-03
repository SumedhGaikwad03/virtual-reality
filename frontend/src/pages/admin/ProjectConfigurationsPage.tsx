/*
 * PURPOSE:
 * Admin project configurations list page.
 *
 * FLOW:
 * Admin Configuration Listing Flow
 *
 * RESPONSIBILITY:
 * Loads the parent Project and lists its property unit configurations (BHK, carpet area,
 * starting price, and availability status) with navigation to add, edit, or manage media.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getProject } from "../../api/admin-projects";
import { getConfigurations } from "../../api/admin-configurations";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProjectWorkspaceNav } from "../../components/admin/ProjectWorkspaceNav";
import type { AdminProject } from "../../types/admin-project";
import type { AdminConfiguration } from "../../types/admin-configuration";

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === 404) return "Project not found.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return "Unable to load configurations. Please try again.";
}

export function ProjectConfigurationsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [configurations, setConfigurations] = useState<AdminConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let active = true;

    // Load parent project and its configurations in parallel to establish parent context
    Promise.all([getProject(projectId), getConfigurations(projectId)])
      .then(([projectResponse, configurationResponse]) => {
        if (!active) return;
        setProject(projectResponse.data);
        setConfigurations(configurationResponse.data);
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
  }, [projectId]);

  if (!projectId) return null;

  return (
    <AdminLayout>
      <div className="admin-top-bar">
        <Link className="admin-action admin-action--secondary" to="/admin/projects">
          ← Back to Projects
        </Link>
      </div>
      {isLoading && <p>Loading configurations...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && project && (
        <>
          <ProjectWorkspaceNav
            projectId={project.id}
            projectName={project.name}
            active="configurations"
            previewHref={`/${project.developer.slug}/${project.locationSlug}/${project.slug}`}
          />
          <div className="admin-page-heading">
            <div>
              <p>Project: {project.name}</p>
              <h1>Configurations</h1>
            </div>
            <button className="admin-action admin-action--primary" type="button" onClick={() => navigate(`/admin/projects/${projectId}/configurations/new`)}>
              Add Configuration
            </button>
          </div>
          {configurations.length === 0 && (
            <section className="admin-card"><p>No configurations found.</p></section>
          )}
          {configurations.length > 0 && (
            <div className="admin-card admin-configuration-list">
              {configurations.map((configuration) => (
                <article className="admin-configuration-row" key={configuration.id}>
                  <div><h2>{configuration.name}</h2><p>{configuration.bhk} BHK</p></div>
                  <p>{configuration.carpetArea} sq ft</p>
                  <p>₹{configuration.priceFrom}</p>
                  <p>{configuration.availabilityStatus}</p>
                  <Link className="admin-action admin-action--secondary" to={`/admin/configurations/${configuration.id}`}>Edit</Link>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
