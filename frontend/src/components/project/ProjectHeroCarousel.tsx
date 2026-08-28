/*
 * PURPOSE:
 * Displays the prominent showcase collection of HERO_CAROUSEL media for a project
 * with accessible slide navigation controls, keyboard navigation, and touch swipe support.
 *
 * FLOW:
 * Public Project Media Flow: ProjectPage -> ProjectHeroCarousel
 *
 * RESPONSIBILITY:
 * Filters project media where category === "HERO_CAROUSEL", orders by sortOrder,
 * manages the active slide index state, and provides user-accessible carousel controls.
 */

import { useState, useRef, type KeyboardEvent, type TouchEvent } from "react";
import type { Media } from "../../types/project";

type ProjectHeroCarouselProps = {
  media: Media[];
};

export function ProjectHeroCarousel({ media }: ProjectHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const carouselItems = media
    .filter((item) => item.category === "HERO_CAROUSEL")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (carouselItems.length === 0) {
    return null;
  }

  // Ensure currentIndex stays within bounds if media items change
  const activeIndex = currentIndex >= carouselItems.length ? 0 : currentIndex;
  const currentItem = carouselItems[activeIndex];
  const hasMultiple = carouselItems.length > 1;

  // Wrap-around index navigation for cyclic carousel browsing
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation: ArrowLeft/ArrowRight to cycle slides when carousel container has focus
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!hasMultiple) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    }
  };

  // Touch swipe handling with a 50px delta threshold to prevent accidental swipes during vertical scroll
  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    const SWIPE_THRESHOLD_PX = 50;

    if (deltaX > SWIPE_THRESHOLD_PX) {
      goToPrevious();
    } else if (deltaX < -SWIPE_THRESHOLD_PX) {
      goToNext();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="project-hero-carousel"
      aria-label="Project Hero Carousel"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="project-hero-carousel-header">
        <h2>Featured Showcase</h2>
        {hasMultiple && (
          <span
            className="project-hero-carousel-counter"
            aria-live="polite"
            aria-atomic="true"
          >
            {activeIndex + 1} / {carouselItems.length}
          </span>
        )}
      </div>

      <div className="project-hero-carousel-stage">
        <article
          key={currentItem.id}
          className="media-item project-hero-carousel-item"
          aria-roledescription="slide"
          aria-label={`Slide ${activeIndex + 1} of ${carouselItems.length}`}
        >
          {currentItem.type === "IMAGE" && (
            <img
              src={currentItem.thumbnailUrl ?? currentItem.url}
              alt={currentItem.altText ?? "Featured showcase image"}
            />
          )}

          {currentItem.type === "VIDEO" && (
            <video
              controls
              src={currentItem.url}
              preload="metadata"
              aria-label={currentItem.altText ?? "Featured showcase video"}
            />
          )}

          {currentItem.type === "DOCUMENT" && (
            <p>
              <a
                href={currentItem.url}
                target="_blank"
                rel="noreferrer"
              >
                Open document
              </a>
            </p>
          )}

          {currentItem.title && (
            <div className="project-hero-carousel-caption">
              <h3>{currentItem.title}</h3>
            </div>
          )}
        </article>
      </div>

      {hasMultiple && (
        <div
          className="project-hero-carousel-controls"
          aria-label="Carousel navigation"
        >
          <button
            type="button"
            className="project-hero-carousel-btn"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            ‹ Previous
          </button>

          <span
            className="project-hero-carousel-counter-mobile"
            aria-hidden="true"
          >
            {activeIndex + 1} / {carouselItems.length}
          </span>

          <button
            type="button"
            className="project-hero-carousel-btn"
            onClick={goToNext}
            aria-label="Next image"
          >
            Next ›
          </button>
        </div>
      )}
    </section>
  );
}
