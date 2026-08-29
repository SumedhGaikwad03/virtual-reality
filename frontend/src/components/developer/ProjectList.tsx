/*
 * PURPOSE:
 * Renders the project list section on the public developer page.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Maps the published projects belonging to the developer into ProjectCard components,
 * or displays an empty state message if none exist.
 */

import type { DeveloperProjectCard as ProjectCardData } from "../../types/developer";
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
