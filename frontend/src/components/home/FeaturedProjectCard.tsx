import { Link } from "react-router-dom";
import type { FeaturedProject } from "../../types/site";

type FeaturedProjectCardProps = {
  project: FeaturedProject;
};

export function FeaturedProjectCard({ project }: FeaturedProjectCardProps) {
  const hasProjectPath = Boolean(
    project.developer.slug && project.location.slug && project.slug,
  );
  const projectPath = `/${project.developer.slug}/${project.location.slug}/${project.slug}`;

  return (
    <article className="featured-project-card">
      {project.heroImage ? (
        <img
          src={project.heroImage.url}
          alt={`${project.name} project`}
        />
      ) : (
        <div className="project-image-fallback">No project image available.</div>
      )}
      <div>
        <h3>{project.name}</h3>
        <p>Developer: {project.developer.name}</p>
        <p>{project.location.name}</p>
        <p>Status: {project.status}</p>
        {hasProjectPath ? (
          <Link to={projectPath}>View project</Link>
        ) : (
          <p>Project link unavailable.</p>
        )}
      </div>
    </article>
  );
}
