import type { Project } from "../../types/project";

type ProjectOverviewProps = {
  project: Project;
};

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <section>
      <h2>Project Overview</h2>
      {project.description && <p>{project.description}</p>}
      <p>{project.location.address}</p>
      <p>{project.location.name}</p>
      {project.location.mapsUrl && (
        <a href={project.location.mapsUrl} target="_blank" rel="noreferrer">
          View on Google Maps
        </a>
      )}
    </section>
  );
}
