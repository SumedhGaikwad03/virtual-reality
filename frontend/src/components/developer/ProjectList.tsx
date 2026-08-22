import type { ProjectCard as ProjectCardData } from "../../types/developer";
import { ProjectCard } from "./ProjectCard";

type ProjectListProps = {
  developerSlug: string;
  projects: ProjectCardData[];
};

export function ProjectList({ developerSlug, projects }: ProjectListProps) {
  return (
    <section>
      <h2>Projects</h2>
      {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : (
        <div className="developer-project-list">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              developerSlug={developerSlug}
              project={project}
            />
          ))}
        </div>
      )}
    </section>
  );
}
