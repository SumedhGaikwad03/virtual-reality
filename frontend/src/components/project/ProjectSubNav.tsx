/*
 * PURPOSE:
 * Renders a lightweight sticky contextual section navigation bar for the public Project page.
 *
 * FLOW:
 * Public Project Discovery Flow: ProjectPage -> ProjectSubNav -> Smooth section scrolling.
 *
 * RESPONSIBILITY:
 * Provides quick anchor navigation buttons to jump directly between Overview, Configurations,
 * Amenities, Location, Developer, and Enquiry sections.
 */

import { scrollToElement } from "../../scroll/scrollTo";

type ProjectSubNavProps = {
  hasConfigurations: boolean;
  hasAmenities: boolean;
  onOpenEnquiry?: (triggerEl?: HTMLElement | null) => void;
};

export function ProjectSubNav({
  hasConfigurations,
  hasAmenities,
  onOpenEnquiry,
}: ProjectSubNavProps) {
  function scrollToSection(id: string) {
    scrollToElement(id);
  }

  function handleEnquireClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (onOpenEnquiry) {
      onOpenEnquiry(e.currentTarget);
    } else {
      scrollToSection("project-lead-heading");
    }
  }

  return (
    <nav className="project-sub-nav" aria-label="Project section navigation">
      <div className="project-sub-nav-container">
        <button
          type="button"
          onClick={() => scrollToSection("project-overview-heading")}
          className="sub-nav-item"
        >
          Overview
        </button>

        {hasConfigurations && (
          <button
            type="button"
            onClick={() => scrollToSection("project-configurations-heading")}
            className="sub-nav-item"
          >
            Configurations
          </button>
        )}

        {hasAmenities && (
          <button
            type="button"
            onClick={() => scrollToSection("project-amenities-heading")}
            className="sub-nav-item"
          >
            Amenities
          </button>
        )}

        <button
          type="button"
          onClick={() => scrollToSection("project-location-heading")}
          className="sub-nav-item"
        >
          Location
        </button>

        <button
          type="button"
          onClick={() => scrollToSection("project-developer-heading")}
          className="sub-nav-item"
        >
          Developer
        </button>

        <button
          type="button"
          onClick={handleEnquireClick}
          className="sub-nav-item sub-nav-enquire-btn"
        >
          Enquire
        </button>
      </div>
    </nav>
  );
}
