/*
 * PURPOSE:
 * Renders the full-bleed atmospheric visual hero section for the public Project page.
 *
 * FLOW:
 * Public Project Discovery Flow: ProjectPage -> ProjectHero.
 *
 * RESPONSIBILITY:
 * Composes a full-width cinematic hero background with project name, location, developer badge,
 * status indicator, and direct enquiry CTA button.
 */

import type { RefObject } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../types/project";
import { scrollToElement } from "../../scroll/scrollTo";

type ProjectHeroProps = {
  project: Project;
  contactRef: RefObject<HTMLFormElement | null>;
  onOpenEnquiry?: (
    triggerEl?: HTMLElement | null,
    intent?: "SCHEDULE_VISIT" | "REQUEST_CALLBACK",
  ) => void;
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
      return status.replace(/_/g, " ");
  }
}

function formatLocationName(name: string): string {
  if (!name) return "";
  if (name === name.toUpperCase()) {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return name;
}

export function ProjectHero({ project, contactRef, onOpenEnquiry }: ProjectHeroProps) {
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
      (item) =>
        item.type === "IMAGE" &&
        item.category !== "HERO_CAROUSEL" &&
        item.isPrimary,
    ) ??
    project.media.find(
      (item) => item.type === "IMAGE" && item.category !== "HERO_CAROUSEL",
    );

  const heroImageUrl = heroMedia?.url || null;

  function handleScheduleVisitClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (onOpenEnquiry) {
      onOpenEnquiry(e.currentTarget, "SCHEDULE_VISIT");
    } else {
      if (contactRef.current) {
        scrollToElement(contactRef.current);
      }
      contactRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }
  }

  function handleRequestCallbackClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (onOpenEnquiry) {
      onOpenEnquiry(e.currentTarget, "REQUEST_CALLBACK");
    } else {
      if (contactRef.current) {
        scrollToElement(contactRef.current);
      }
      contactRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }
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
        <div className="project-hero-eyebrow-row">
          <span className="project-hero-status-label">{formatStatus(project.status)}</span>
          <span className="project-hero-meta-divider" aria-hidden="true">·</span>
          <Link to={`/${project.developer.slug}`} className="project-hero-developer-link">
            {project.developer.name}
          </Link>
        </div>

        <h1 className="project-hero-headline">{project.name}</h1>

        <div className="project-hero-location-row">
          <span className="project-hero-location">{formatLocationName(project.location.name)}</span>
        </div>

        <div className="project-hero-actions">
          <button
            type="button"
            className="project-hero-contact-btn"
            onClick={handleScheduleVisitClick}
          >
            Schedule a Visit →
          </button>
          <button
            type="button"
            className="project-hero-secondary-btn"
            onClick={handleRequestCallbackClick}
          >
            Request a Callback
          </button>
        </div>
      </div>
    </section>
  );
}
