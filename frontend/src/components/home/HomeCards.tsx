/*
 * PURPOSE:
 * Displays site-level CARD category media on the homepage.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Filters media items where category === "CARD", orders by sortOrder,
 * and renders promotional/highlight cards supporting images, videos, and documents.
 */

import type { HomeMedia } from "../../types/site";

type HomeCardsProps = {
  media: HomeMedia[];
};

export function HomeCards({
  media,
}: HomeCardsProps) {
  const cards = media
    .filter((item) => item.category === "CARD")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="home-cards" aria-label="Firm highlights">
      <div className="home-cards-list">
        {cards.map((card) => (
          <article key={card.id} className="home-card-item">
            {card.type === "IMAGE" && (
              <img
                src={card.thumbnailUrl ?? card.url}
                alt={
                  card.altText ??
                  card.title ??
                  "Firm card visual"
                }
              />
            )}

            {card.type === "VIDEO" && (
              <video
                src={card.url}
                controls
                preload="metadata"
                aria-label={card.altText ?? card.title ?? "Firm card video"}
              />
            )}

            {card.type === "DOCUMENT" && (
              <p>
                <a
                  href={card.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open document ({card.title ?? "Firm document"})
                </a>
              </p>
            )}

            {card.title && <h3>{card.title}</h3>}

            {card.slot && <p>{card.slot}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}