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

type ProjectSubNavProps = {
  hasConfigurations: boolean;
  hasAmenities: boolean;
};

export function ProjectSubNav({ hasConfigurations, hasAmenities }: ProjectSubNavProps) {
  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
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
          onClick={() => scrollToSection("project-lead-heading")}
          className="sub-nav-item sub-nav-enquire-btn"
        >
          Enquire
        </button>
      </div>
    </nav>
  );
}
