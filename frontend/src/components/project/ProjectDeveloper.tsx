/*
 * PURPOSE:
 * Renders developer attribution and link section on the public Project page.
 *
 * FLOW:
 * Public Project Discovery Flow: ProjectPage -> ProjectDeveloper -> Route /:developerSlug.
 *
 * RESPONSIBILITY:
 * Connects the project back to the Developer Page using existing developer relationship.
 */

import { Link } from "react-router-dom";
import type { Developer } from "../../types/project";

type ProjectDeveloperProps = {
  developer: Developer;
};

export function ProjectDeveloper({ developer }: ProjectDeveloperProps) {
  const initialLetter = developer.name ? developer.name.charAt(0).toUpperCase() : "D";

  return (
    <section className="project-developer-section" aria-labelledby="project-developer-heading">
      <div className="project-developer-container">
        <span className="section-eyebrow">DEVELOPER</span>
        <h2 id="project-developer-heading" className="project-developer-title">
          Developed by {developer.name}
        </h2>

        <div className="project-developer-card">
          {developer.logoUrl ? (
            <img
              src={developer.logoUrl}
              alt={`${developer.name} logo`}
              className="project-developer-logo"
            />
          ) : (
            <div className="project-developer-badge" aria-hidden="true">
              {initialLetter}
            </div>
          )}

          <div className="project-developer-info">
            <h3 className="developer-name-heading">{developer.name}</h3>
            <p className="developer-tagline">Explore full developer portfolio and active developments.</p>
            <Link to={`/${developer.slug}`} className="project-developer-link">
              Explore Developer Profile →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
