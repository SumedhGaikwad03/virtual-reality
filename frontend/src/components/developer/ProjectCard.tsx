/*
 * PURPOSE:
 * Renders an individual project card within the developer profile context.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Displays project card media (with fallback), project title, location, status badge,
 * featured tag, and public navigation link to the project page.
 */

import { Link } from "react-router-dom";
import type { DeveloperProjectCard as ProjectCardData } from "../../types/developer";

type ProjectCardProps = {
  developerSlug: string;
  project: ProjectCardData;
};

export function ProjectCard({ developerSlug, project }: ProjectCardProps) {
  const projectPath = `/${developerSlug}/${project.location.slug}/${project.slug}`;

  return (
    <article className="developer-project-card">
      {project.media ? (
        <img
          src={project.media.url}
          alt={project.media.altText ?? `${project.name} project`}
        />
      ) : (
        <div className="project-image-fallback">No project image available.</div>
      )}
      <div>
        <h3>{project.name}</h3>
        <p>{project.location.name}</p>
        <p>Status: {project.status}</p>
        {project.featured && <p>Featured</p>}
        <Link to={projectPath}>View project</Link>
      </div>
    </article>
  );
}
