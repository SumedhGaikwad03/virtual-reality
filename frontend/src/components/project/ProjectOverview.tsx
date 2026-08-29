/*
 * PURPOSE:
 * Renders the project introduction, identity, narrative, and highlights section on the public Project page.
 *
 * FLOW:
 * Public Project Discovery Flow: ProjectPage -> ProjectOverview.
 *
 * RESPONSIBILITY:
 * Displays project identity narrative, location context, status summary, and key project highlights.
 */

import { Link } from "react-router-dom";
import type { Project } from "../../types/project";

type ProjectOverviewProps = {
  project: Project;
};

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const sortedHighlights = [...project.highlights].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="project-overview-section" aria-labelledby="project-overview-heading">
      <div className="project-overview-container">
        <span className="section-eyebrow">OVERVIEW</span>
        <h2 id="project-overview-heading" className="project-overview-title">
          About {project.name}
        </h2>

        {project.description ? (
          <p className="project-overview-description">{project.description}</p>
        ) : (
          <p className="project-overview-description fallback">
            A premium development by{" "}
            <Link to={`/${project.developer.slug}`}>{project.developer.name}</Link> located in{" "}
            {project.location.name}.
          </p>
        )}

        {sortedHighlights.length > 0 && (
          <div className="project-highlights-container">
            <h3 className="project-highlights-subtitle">Key Highlights</h3>
            <ul className="project-highlights-grid">
              {sortedHighlights.map((highlight) => (
                <li key={highlight.id} className="project-highlight-item">
                  <span className="highlight-bullet" aria-hidden="true">•</span>
                  <span className="highlight-text">{highlight.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
