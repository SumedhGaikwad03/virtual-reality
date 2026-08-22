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
