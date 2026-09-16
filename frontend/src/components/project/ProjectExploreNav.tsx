/*
 * PURPOSE:
 * Provides compact in-page discovery links for the public Project Page.
 *
 * FLOW:
 * ProjectPage derives available sections from its project payload -> ProjectExploreNav -> existing section anchors.
 *
 * RESPONSIBILITY:
 * Offers progressive-disclosure navigation without creating duplicate project content or routes.
 */

import { scrollToElement } from "../../scroll/scrollTo";

type ProjectExploreNavProps = {
  hasConfigurations: boolean;
  hasShowcase: boolean;
  showcaseTarget: string;
  hasAmenities: boolean;
  hasGallery: boolean;
  onOpenEnquiry?: (triggerEl?: HTMLElement | null) => void;
};

export function ProjectExploreNav({
  hasConfigurations,
  hasShowcase,
  showcaseTarget,
  hasAmenities,
  hasGallery,
  onOpenEnquiry,
}: ProjectExploreNavProps) {
  const items = [
    hasConfigurations && {
      label: "Configurations",
      description: "BHKs, area & pricing",
      target: "project-configurations-heading",
    },
    hasShowcase && {
      label: "Showcase",
      description: "Interiors & architecture",
      target: showcaseTarget,
    },
    hasAmenities && {
      label: "Amenities",
      description: "Features worth knowing",
      target: "project-amenities-heading",
    },
    {
      label: "Location",
      description: "Connectivity & surroundings",
      target: "project-location-heading",
    },
    hasGallery && {
      label: "Gallery",
      description: "Explore project imagery",
      target: "project-gallery-heading",
    },
    {
      label: "Enquire",
      description: "Start a conversation",
      target: "project-lead-heading",
    },
  ].filter(Boolean) as Array<{
    label: string;
    description: string;
    target: string;
  }>;

  function handleItemClick(item: { label: string; target: string }, e: React.MouseEvent<HTMLButtonElement>) {
    if (item.label === "Enquire" && onOpenEnquiry) {
      onOpenEnquiry(e.currentTarget);
    } else {
      scrollToElement(item.target);
    }
  }

  return (
    <nav className="project-explore-nav" aria-label="Explore this project">
      <div className="project-explore-nav-header">
        <span className="section-eyebrow">EXPLORE THIS PROJECT</span>
        <p>Jump to the details that matter to you.</p>
      </div>

      <div className="project-explore-nav-grid">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="project-explore-nav-card"
            onClick={(e) => handleItemClick(item, e)}
          >
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
