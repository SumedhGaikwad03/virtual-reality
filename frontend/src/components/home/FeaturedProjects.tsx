import type { FeaturedProject } from "../../types/site";
import { FeaturedProjectCard } from "./FeaturedProjectCard";

type FeaturedProjectsProps = {
  projects: FeaturedProject[];
};

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <section>
      <h2>Featured Projects</h2>
      {projects.length === 0 ? (
        <p>No featured projects available.</p>
      ) : (
        <div className="featured-project-list">
          {projects.map((project) => (
            <FeaturedProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
