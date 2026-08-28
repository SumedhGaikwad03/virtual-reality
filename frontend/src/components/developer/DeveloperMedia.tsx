/*
 * PURPOSE:
 * Renders the brand media showcase grid on the public developer page.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Filters and renders active developer brand imagery in a visual grid.
 * Returns null if no images are present.
 */

import type { Media } from "../../types/project";

type DeveloperMediaProps = {
  media: Media[];
};

export function DeveloperMedia({ media }: DeveloperMediaProps) {
  const images = media.filter((item) => item.type === "IMAGE");

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="developer-media">
      <div className="developer-media-header">
        <p>Discover the developer</p>
        <h2>Built around better places to live.</h2>
      </div>

      <div className="developer-media-grid">
        {images.map((item) => (
          <figure key={item.id} className="developer-media-item">
            <img
              src={item.url}
              alt={item.altText ?? ""}
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}