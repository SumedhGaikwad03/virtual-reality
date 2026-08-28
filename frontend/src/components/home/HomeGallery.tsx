/*
 * PURPOSE:
 * Displays site-level GALLERY category media on the homepage.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Filters media items where category === "GALLERY", orders by sortOrder,
 * and renders a browsable image/video/document gallery with captions.
 */

import type { HomeMedia } from "../../types/site";

type HomeGalleryProps = {
  media: HomeMedia[];
};

export function HomeGallery({
  media,
}: HomeGalleryProps) {
  const gallery = media
    .filter((item) => item.category === "GALLERY")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (gallery.length === 0) {
    return null;
  }

  return (
    <section className="home-gallery" aria-label="Firm Gallery">
      <h2>Gallery</h2>

      <div className="home-gallery-list">
        {gallery.map((item) => (
          <figure key={item.id} className="home-gallery-item">
            {item.type === "IMAGE" && (
              <img
                src={item.thumbnailUrl ?? item.url}
                alt={
                  item.altText ??
                  item.title ??
                  "Gallery image"
                }
              />
            )}

            {item.type === "VIDEO" && (
              <video
                src={item.url}
                controls
                preload="metadata"
                aria-label={item.altText ?? item.title ?? "Gallery video"}
              />
            )}

            {item.type === "DOCUMENT" && (
              <p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open document ({item.title ?? "Gallery document"})
                </a>
              </p>
            )}

            {item.title && (
              <figcaption>
                {item.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}