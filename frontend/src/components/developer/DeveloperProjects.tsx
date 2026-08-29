/*
 * PURPOSE:
 * Renders the project portfolio section for the public Developer page.
 *
 * FLOW:
 * Public Developer Discovery Flow: DeveloperPage -> DeveloperProjects -> Project Card Link to /:developerSlug/:locationSlug/:projectSlug.
 *
 * RESPONSIBILITY:
 * Displays published projects in an editorial horizontal carousel with desktop prev/next controls,
 * mobile CSS scroll-snap, or renders an intentional "Projects coming soon" zero-project state.
 */

import { useRef } from "react";
import { Link } from "react-router-dom";
import type { DeveloperProjectCard, PublicDeveloper } from "../../types/developer";

type DeveloperProjectsProps = {
  developer: PublicDeveloper;
};

function formatStatus(status: string) {
  switch (status) {
    case "READY_TO_MOVE":
      return "Ready to Move";
    case "UPCOMING":
      return "Upcoming";
    case "ONGOING":
      return "Under Construction";
    case "COMPLETED":
      return "Completed";
    case "SOLD_OUT":
      return "Sold Out";
    default:
      return status;
  }
}

export function DeveloperProjects({ developer }: DeveloperProjectsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const projects = developer.projects;

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  if (projects.length === 0) {
    return (
      <section className="developer-projects-section" aria-labelledby="developer-projects-heading">
        <div className="section-header-editorial">
          <span className="section-eyebrow">PORTFOLIO</span>
          <h2 id="developer-projects-heading" className="section-title">
            Projects by Developer
          </h2>
        </div>
        <div className="zero-projects-card">
          <h3 className="zero-projects-title">Projects coming soon.</h3>
          <p className="zero-projects-description">
            Explore this developer's upcoming portfolio as new projects are published.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="developer-projects-section" aria-labelledby="developer-projects-heading">
      <div className="section-header-with-controls">
        <div>
          <span className="section-eyebrow">PORTFOLIO</span>
          <h2 id="developer-projects-heading" className="section-title">
            Projects by Developer
          </h2>
        </div>
        <div className="featured-carousel-controls" aria-label="Projects carousel navigation">
          <button
            type="button"
            className="carousel-nav-btn"
            onClick={() => handleScroll("left")}
            aria-label="Previous projects"
            title="Previous"
          >
            ←
          </button>
          <button
            type="button"
            className="carousel-nav-btn"
            onClick={() => handleScroll("right")}
            aria-label="Next projects"
            title="Next"
          >
            →
          </button>
        </div>
      </div>

      <div
        className="featured-project-scroll-container"
        ref={scrollContainerRef}
        tabIndex={0}
        aria-label="Projects by developer carousel"
      >
        <div className="featured-project-list">
          {projects.map((project: DeveloperProjectCard) => {
            const projectPath = `/${developer.slug}/${project.location.slug}/${project.slug}`;
            const mediaItem = project.heroImage || project.media;

            return (
              <article key={project.id} className="featured-project-card">
                <Link to={projectPath} className="featured-project-card-link">
                  <div className="featured-project-media">
                    {mediaItem ? (
                      <img
                        src={mediaItem.url}
                        alt={mediaItem.altText || project.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="project-image-fallback">{project.name}</div>
                    )}
                    <span className="project-status-badge">{formatStatus(project.status)}</span>
                  </div>
                  <div className="featured-project-info">
                    <span className="project-developer-tag">{developer.name}</span>
                    <h3 className="project-card-title">{project.name}</h3>
                    <p className="project-card-location">{project.location.name}</p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
