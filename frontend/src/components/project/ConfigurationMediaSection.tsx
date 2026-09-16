/*
 * PURPOSE:
 * Displays configuration-specific media, floor plans, unit plans, and brochures on the public project page.
 *
 * FLOW:
 * Public Configuration Media Flow
 *
 * RESPONSIBILITY:
 * Groups configuration media by category (FLOOR_PLAN, GALLERY, INTERIOR, AMENITY, BROCHURE, Other Media)
 * and renders images, videos, and downloadable document links when a configuration is selected.
 */

import { useMemo, useRef, useState } from "react";
import type {
  Configuration,
  Media,
  MediaCategory,
} from "../../types/project";
import { ProjectImageLightbox } from "./ProjectImageLightbox";

type ConfigurationMediaSectionProps = {
  configuration: Configuration | null | undefined;
  onOpenEnquiry?: (triggerEl?: HTMLElement | null) => void;
};

// Unit-specific media categories: ordered to present architectural layout (floor plans) first, followed by photos and documents
const configurationCategories: MediaCategory[] = [
  "FLOOR_PLAN",
  "GALLERY",
  "INTERIOR",
  "AMENITY",
  "BROCHURE",
];

const categoryLabels: Record<MediaCategory, string> = {
  FLOOR_PLAN: "Floor Plan",
  GALLERY: "Gallery",
  INTERIOR: "Interior",
  AMENITY: "Amenities",
  BROCHURE: "Brochures & Documents",
  HERO: "Hero",
  HERO_CAROUSEL: "Hero Carousel",
  CARD: "Card",
  EXTERIOR: "Exterior",
  LOCATION: "Location",
  CONSTRUCTION: "Construction",
  PROJECT_VIDEO: "Project Video",
};

export function ConfigurationMediaSection({
  configuration,
  onOpenEnquiry,
}: ConfigurationMediaSectionProps) {
  const [activeLightboxMedia, setActiveLightboxMedia] = useState<Media | null>(null);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);

  if (!configuration) {
    return null;
  }

  const media = configuration.media ?? [];

  const groupedMedia = useMemo(() => {
    return configurationCategories
      .map((category) => ({
        category,
        label: categoryLabels[category] ?? category,
        items: media
          .filter((item) => item.category === category)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .filter((group) => group.items.length > 0);
  }, [media]);

  const uncategorizedMedia = useMemo(() => {
    return media
      .filter(
        (item) => !configurationCategories.includes(item.category),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [media]);

  const handleOpenFloorPlan = (item: Media, triggerEl: HTMLElement) => {
    lightboxTriggerRef.current = triggerEl;
    setActiveLightboxMedia(item);
  };

  return (
    <section
      id="photos"
      className="configuration-media-section"
      aria-label={`${configuration.name} Media`}
    >
      <div className="configuration-media-container">
        <div className="configuration-media-header-bar">
          <div>
            <span className="section-eyebrow">LAYOUT DETAILS</span>
            <h2 className="configuration-media-title">{configuration.name} · Media & Floor Plans</h2>
          </div>
          {onOpenEnquiry && (
            <button
              type="button"
              className="config-media-enquiry-btn"
              onClick={(e) => onOpenEnquiry(e.currentTarget)}
            >
              Enquire for {configuration.name} →
            </button>
          )}
        </div>

      {media.length === 0 ? (
        <p>No media available for {configuration.name}.</p>
      ) : (
        <>
          {groupedMedia.map(({ category, label, items }) => (
            <div
              key={category}
              className="configuration-media-group"
            >
              <h3>{label}</h3>

              <div className="media-list">
                {items.map((item) => (
                  <ConfigurationMediaItem
                    key={item.id}
                    item={item}
                    categoryLabel={label}
                    configurationName={configuration.name}
                    onOpenFloorPlan={handleOpenFloorPlan}
                  />
                ))}
              </div>
            </div>
          ))}

          {uncategorizedMedia.length > 0 && (
            <div className="configuration-media-group">
              <h3>Other Media</h3>

              <div className="media-list">
                {uncategorizedMedia.map((item) => (
                  <ConfigurationMediaItem
                    key={item.id}
                    item={item}
                    categoryLabel="Other Media"
                    configurationName={configuration.name}
                    onOpenFloorPlan={handleOpenFloorPlan}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>

      <ProjectImageLightbox
        isOpen={Boolean(activeLightboxMedia)}
        imageUrl={activeLightboxMedia?.url ?? ""}
        altText={activeLightboxMedia?.altText ?? `${configuration.name} Floor Plan`}
        title={`${configuration.name} · Floor Plan`}
        onClose={() => setActiveLightboxMedia(null)}
        triggerRef={lightboxTriggerRef}
      />
    </section>
  );
}

function ConfigurationMediaItem({
  item,
  categoryLabel,
  configurationName,
  onOpenFloorPlan,
}: {
  item: Media;
  categoryLabel: string;
  configurationName: string;
  onOpenFloorPlan?: (item: Media, triggerEl: HTMLElement) => void;
}) {
  const isFloorPlan = item.category === "FLOOR_PLAN";

  return (
    <article className="media-item configuration-media-item">
      {item.type === "IMAGE" && (
        isFloorPlan ? (
          <button
            type="button"
            className="floor-plan-image-trigger"
            onClick={(e) => onOpenFloorPlan?.(item, e.currentTarget)}
            aria-label={`Enlarge floor plan for ${configurationName}`}
          >
            <img
              src={item.thumbnailUrl ?? item.url}
              alt={
                item.altText ??
                `${categoryLabel} for this configuration`
              }
            />
            <span className="floor-plan-expand-badge" aria-hidden="true">
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
        ) : (
          <img
            src={item.thumbnailUrl ?? item.url}
            alt={
              item.altText ??
              `${categoryLabel} for this configuration`
            }
          />
        )
      )}

      {item.type === "VIDEO" && (
        <video
          controls
          src={item.url}
          preload="metadata"
          aria-label={item.altText ?? categoryLabel}
        />
      )}

      {item.type === "DOCUMENT" && (
        <p>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            Open document ({categoryLabel})
          </a>
        </p>
      )}
    </article>
  );
}
