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

import { useRef, useState } from "react";
import type { Location, Media } from "../../types/project";
import { ProjectImageLightbox } from "./ProjectImageLightbox";
import { getOptimizedImageUrl } from "../../utils/image";

type ProjectLocationProps = {
  location: Location;
  locationMedia?: Media | null;
};

export function ProjectLocation({ location, locationMedia }: ProjectLocationProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

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
            <button
              ref={triggerRef}
              type="button"
              className="location-map-image-trigger"
              onClick={() => setIsLightboxOpen(true)}
              aria-label={`Enlarge location map for ${location.name}`}
            >
              <img
                src={getOptimizedImageUrl(locationMedia.url, { width: 1200 })}
                alt={locationMedia.altText ?? `${location.name} location map and surroundings`}
                loading="lazy"
              />
              <span className="location-map-expand-badge" aria-hidden="true">
                <svg
                  className="expand-icon"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
                <span>Tap to enlarge</span>
              </span>
            </button>
            {locationMedia.altText && (
              <span className="location-media-caption">{locationMedia.altText}</span>
            )}
          </div>
        )}
      </div>

      {locationMedia && (
        <ProjectImageLightbox
          isOpen={isLightboxOpen}
          imageUrl={getOptimizedImageUrl(locationMedia.url)}
          altText={locationMedia.altText ?? `${location.name} location map and surroundings`}
          title={locationMedia.altText ?? `${location.name} · Location Map`}
          onClose={() => setIsLightboxOpen(false)}
          triggerRef={triggerRef}
        />
      )}
    </section>
  );
}
