/*
 * PURPOSE:
 * Renders dedicated first-class Amenities section on the public Project page.
 *
 * FLOW:
 * Public Project Discovery Flow: ProjectPage -> ProjectAmenities.
 *
 * RESPONSIBILITY:
 * Displays every available project amenity as a clean, floating editorial card
 * with refined typography, sortOrder preservation, comfortable whitespace,
 * and graceful zero-amenities omission.
 */

import type { ProjectAmenity } from "../../types/project";

type ProjectAmenitiesProps = {
  amenities: ProjectAmenity[];
};

export function ProjectAmenities({ amenities }: ProjectAmenitiesProps) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  const sortedAmenities = [...amenities].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="project-amenities-section" aria-labelledby="project-amenities-heading">
      <div className="project-amenities-container">
        <span className="section-eyebrow">AMENITIES & FEATURES</span>
        <h2 id="project-amenities-heading" className="project-amenities-title">
          Amenities
        </h2>
        <p className="project-amenities-subtitle">
          Thoughtfully curated features and lifestyle amenities designed for an elevated residential experience.
        </p>

        <div className="project-amenities-grid">
          {sortedAmenities.map((amenity) => (
            <div key={amenity.id} className="project-amenity-card">
              <span className="amenity-name">{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
