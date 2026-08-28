/*
 * PURPOSE:
 * Renders an individual featured project card on the homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> FeaturedProjects -> FeaturedProjectCard -> /:developerSlug/:locationSlug/:projectSlug.
 *
 * RESPONSIBILITY:
 * Displays project hero image, title, developer name, location, status badge,
 * and makes the entire card clickable navigating directly to the public project page.
 */

import { Link } from "react-router-dom";
import type { FeaturedProject } from "../../types/site";

type FeaturedProjectCardProps = {
  project: FeaturedProject;
};

function formatStatus(status: string) {
  switch (status) {
    case "READY_TO_MOVE":
      return "Ready to Move";
    case "UPCOMING":
      return "Upcoming";
    case "ONGOING":
      return "Under Construction";
    case "COMPLETED":
      return "Completed";
    case "SOLD_OUT":
      return "Sold Out";
    default:
      return status;
  }
}

export function FeaturedProjectCard({ project }: FeaturedProjectCardProps) {
  const hasProjectPath = Boolean(
    project.developer?.slug && project.location?.slug && project.slug,
  );
  const projectPath = `/${project.developer?.slug}/${project.location?.slug}/${project.slug}`;

  const cardContent = (
    <>
      <div className="featured-project-media">
        {project.heroImage ? (
          <img
            src={project.heroImage.url}
            alt={project.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="project-image-fallback">{project.name}</div>
        )}
        <span className="project-status-badge">{formatStatus(project.status)}</span>
      </div>
      <div className="featured-project-info">
        <span className="project-developer-tag">{project.developer?.name}</span>
        <h3 className="project-card-title">{project.name}</h3>
        <p className="project-card-location">{project.location?.name}</p>
      </div>
    </>
  );

  if (!hasProjectPath) {
    return <article className="featured-project-card disabled">{cardContent}</article>;
  }

  return (
    <article className="featured-project-card">
      <Link to={projectPath} className="featured-project-card-link">
        {cardContent}
      </Link>
    </article>
  );
}
