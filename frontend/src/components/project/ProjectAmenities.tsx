/*
 * PURPOSE:
 * Renders dedicated first-class Amenities section on the public Project page.
 *
 * FLOW:
 * Public Project Discovery Flow: ProjectPage -> ProjectAmenities.
 *
 * RESPONSIBILITY:
 * Displays every available project amenity in a clean editorial grid (3-4 cols desktop, 2 cols mobile)
 * with consistent icon badge, typography, sortOrder preservation, and graceful zero-amenities omission.
 */

import type { ProjectAmenity } from "../../types/project";

type ProjectAmenitiesProps = {
  amenities: ProjectAmenity[];
};

// Helper function to pick a clean icon symbol based on amenity name keywords
function getAmenityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("pool") || lower.includes("swim")) {
    return "🏊";
  }
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("health")) {
    return "🏋️";
  }
  if (lower.includes("park") || lower.includes("garden") || lower.includes("landscape") || lower.includes("green")) {
    return "🌿";
  }
  if (lower.includes("security") || lower.includes("cctv") || lower.includes("gate")) {
    return "🛡️";
  }
  if (lower.includes("park") || lower.includes("car") || lower.includes("garage")) {
    return "🚗";
  }
  if (lower.includes("play") || lower.includes("kid") || lower.includes("child")) {
    return "🛝";
  }
  if (lower.includes("club") || lower.includes("lounge") || lower.includes("hall")) {
    return "🏛️";
  }
  if (lower.includes("court") || lower.includes("sport") || lower.includes("tennis") || lower.includes("badminton")) {
    return "🎾";
  }
  if (lower.includes("power") || lower.includes("backup") || lower.includes("generator")) {
    return "⚡";
  }
  if (lower.includes("lift") || lower.includes("elevator")) {
    return "🛗";
  }
  return "✦";
}

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
              <span className="amenity-icon-badge" aria-hidden="true">
                {getAmenityIcon(amenity.name)}
              </span>
              <span className="amenity-name">{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
