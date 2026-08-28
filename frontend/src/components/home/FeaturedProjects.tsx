/*
 * PURPOSE:
 * Renders the featured projects section on the homepage as an editorial horizontal carousel.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> FeaturedProjects -> FeaturedProjectCard -> /:developerSlug/:locationSlug/:projectSlug.
 *
 * RESPONSIBILITY:
 * Composes an editorial horizontal showcase of featured project cards with subtle desktop prev/next controls,
 * mobile CSS scroll-snap, and full card clickability.
 */

import { useRef } from "react";
import type { FeaturedProject } from "../../types/site";
import { FeaturedProjectCard } from "./FeaturedProjectCard";

type FeaturedProjectsProps = {
  projects: FeaturedProject[];
};

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      <section className="featured-projects-section" aria-labelledby="featured-heading">
        <div className="section-header-editorial">
          <span className="section-eyebrow">CURATED PORTFOLIO</span>
          <h2 id="featured-heading" className="section-title">
            Featured Projects
          </h2>
        </div>
        <p className="no-projects-notice">No featured projects available.</p>
      </section>
    );
  }

  return (
    <section className="featured-projects-section" aria-labelledby="featured-heading">
      <div className="section-header-with-controls">
        <div>
          <span className="section-eyebrow">CURATED PORTFOLIO</span>
          <h2 id="featured-heading" className="section-title">
            Featured Projects
          </h2>
        </div>
        <div className="featured-carousel-controls" aria-label="Carousel navigation">
          <button
            type="button"
            className="carousel-nav-btn"
            onClick={() => handleScroll("left")}
            aria-label="Previous featured projects"
            title="Previous"
          >
            ←
          </button>
          <button
            type="button"
            className="carousel-nav-btn"
            onClick={() => handleScroll("right")}
            aria-label="Next featured projects"
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
        aria-label="Featured projects carousel"
      >
        <div className="featured-project-list">
          {projects.map((project) => (
            <FeaturedProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
