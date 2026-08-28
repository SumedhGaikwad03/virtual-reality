/*
 * PURPOSE:
 * Renders the top brand header section for a project on the public project page.
 *
 * FLOW:
 * Public Project Discovery Flow
 *
 * RESPONSIBILITY:
 * Displays developer name, project title, location name, and status badge.
 */

import type { Project } from "../../types/project";

type ProjectHeaderProps = {
  project: Project;
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <header className="project-header">
      <p>{project.developer.name}</p>
      <h1>{project.name}</h1>
      <p>{project.location.name}</p>
      <p>Status: {project.status}</p>
    </header>
  );
}
