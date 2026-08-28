/*
 * PURPOSE:
 * Displays categorized project-level media galleries on the public project page.
 *
 * FLOW:
 * Public Project Media Flow
 *
 * RESPONSIBILITY:
 * Groups project media by semantic categories (GALLERY, EXTERIOR, INTERIOR, LOCATION, CONSTRUCTION, PROJECT_VIDEO, Other Media)
 * and renders images, videos, and document attachments.
 */

import { useMemo } from "react";
import type { Media, MediaCategory } from "../../types/project";

type MediaSectionProps = {
  media: Media[];
};

const projectMediaCategories: MediaCategory[] = [
  "GALLERY",
  "EXTERIOR",
  "INTERIOR",
  "LOCATION",
  "CONSTRUCTION",
  "PROJECT_VIDEO",
];

const categoryLabels: Record<MediaCategory, string> = {
  GALLERY: "Project Gallery",
  EXTERIOR: "Exterior & Architecture",
  INTERIOR: "Interior Spaces",
  LOCATION: "Location & Surroundings",
  CONSTRUCTION: "Construction Updates",
  PROJECT_VIDEO: "Project Videos",
  HERO: "Hero",
  HERO_CAROUSEL: "Hero Carousel",
  CARD: "Card",
  AMENITY: "Amenities",
  FLOOR_PLAN: "Floor Plan",
  BROCHURE: "Brochure",
};

export function MediaSection({ media }: MediaSectionProps) {
  const groupedMedia = useMemo(() => {
    return projectMediaCategories
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
        (item) =>
          !projectMediaCategories.includes(item.category) &&
          item.category !== "HERO" &&
          item.category !== "HERO_CAROUSEL",
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [media]);

  if (groupedMedia.length === 0 && uncategorizedMedia.length === 0) {
    return null;
  }

  return (
    <section className="project-media-section" aria-label="Project Media">
      <h2>Project Media</h2>

      {groupedMedia.map(({ category, label, items }) => (
        <div key={category} className="project-media-group">
          <h3>{label}</h3>

          <div className="media-list">
            {items.map((item) => (
              <ProjectMediaItem
                key={item.id}
                item={item}
                categoryLabel={label}
              />
            ))}
          </div>
        </div>
      ))}

      {uncategorizedMedia.length > 0 && (
        <div className="project-media-group">
          <h3>Other Media</h3>

          <div className="media-list">
            {uncategorizedMedia.map((item) => (
              <ProjectMediaItem
                key={item.id}
                item={item}
                categoryLabel="Other Media"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ProjectMediaItem({
  item,
  categoryLabel,
}: {
  item: Media;
  categoryLabel: string;
}) {
  return (
    <article className="media-item project-media-item">
      {item.type === "IMAGE" && (
        <img
          src={item.thumbnailUrl ?? item.url}
          alt={
            item.altText ??
            `${categoryLabel} image`
          }
        />
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
