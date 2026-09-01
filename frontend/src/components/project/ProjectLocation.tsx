/*
 * PURPOSE:
 * Renders location and address details section on the public Project page.
 *
 * FLOW:
 * Public Project Discovery Flow: ProjectPage -> ProjectLocation.
 *
 * RESPONSIBILITY:
 * Displays locality name, full street address, and an outbound Google Maps link.
 */

import type { Location, Media } from "../../types/project";

type ProjectLocationProps = {
  location: Location;
  locationMedia?: Media | null;
};

export function ProjectLocation({ location, locationMedia }: ProjectLocationProps) {
  return (
    <section className="project-location-section" aria-labelledby="project-location-heading">
      <div className="project-location-container">
        <div className="project-location-content">
          <span className="section-eyebrow">LOCATION & SURROUNDINGS</span>
          <h2 id="project-location-heading" className="project-location-title">
            {location.name}
          </h2>
          <p className="project-location-address">{location.address}</p>

          {location.mapsUrl && (
            <div className="project-location-action">
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="project-maps-link"
              >
                View on Google Maps →
              </a>
            </div>
          )}
        </div>

        {locationMedia && (
          <div className="project-location-media-card">
            <img
              src={locationMedia.url}
              alt={locationMedia.altText ?? `${location.name} location map and surroundings`}
              loading="lazy"
            />
            {locationMedia.title && (
              <span className="location-media-caption">{locationMedia.title}</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
