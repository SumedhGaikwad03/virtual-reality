/*
 * PURPOSE:
 * Renders the full-bleed atmospheric visual hero section for the public Project page.
 *
 * FLOW:
 * Public Project Discovery Flow: ProjectPage -> ProjectHero.
 *
 * RESPONSIBILITY:
 * Composes a full-width cinematic hero background with project name, location, developer badge,
 * status indicator, and direct smooth-scroll contact CTA button.
 */

import type { RefObject } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../types/project";

type ProjectHeroProps = {
  project: Project;
  contactRef: RefObject<HTMLFormElement | null>;
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

export function ProjectHero({ project, contactRef }: ProjectHeroProps) {
  // Deterministic hero image selection priority:
  // 1. IMAGE + HERO category + isPrimary === true
  // 2. IMAGE + HERO category
  // 3. IMAGE + isPrimary === true
  // 4. First IMAGE available
  const heroMedia =
    project.media.find(
      (item) =>
        item.type === "IMAGE" &&
        item.category === "HERO" &&
        item.isPrimary,
    ) ??
    project.media.find(
      (item) => item.type === "IMAGE" && item.category === "HERO",
    ) ??
    project.media.find(
      (item) => item.type === "IMAGE" && item.isPrimary,
    ) ??
    project.media.find((item) => item.type === "IMAGE");

  const heroImageUrl = heroMedia?.url || null;

  function handleContactClick() {
    contactRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    contactRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }

  return (
    <section className="project-hero" aria-label={`${project.name} project hero`}>
      <div className="project-hero-media-wrapper">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={heroMedia?.altText || `${project.name} primary hero`}
            className="project-hero-image"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="project-hero-fallback-bg" />
        )}
        <div className="project-hero-gradient-overlay" />
      </div>

      <div className="floating-project-hero-content">
        <div className="project-hero-meta-badges">
          <span className="project-hero-status-badge">{formatStatus(project.status)}</span>
          <Link to={`/${project.developer.slug}`} className="project-hero-developer-link">
            By {project.developer.name}
          </Link>
        </div>

        <h1 className="project-hero-headline">{project.name}</h1>
        <p className="project-hero-location">{project.location.name}</p>

        <div className="project-hero-actions">
          <button
            type="button"
            className="project-hero-contact-btn"
            onClick={handleContactClick}
          >
            Enquire Now →
          </button>
        </div>
      </div>
    </section>
  );
}
