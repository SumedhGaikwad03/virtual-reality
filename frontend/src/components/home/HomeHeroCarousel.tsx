/*
 * PURPOSE:
 * Displays the prominent showcase collection of HERO_CAROUSEL media on the homepage
 * with accessible slide navigation controls, keyboard navigation, and touch swipe support.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> HomeHeroCarousel
 *
 * RESPONSIBILITY:
 * Filters media items where category === "HERO_CAROUSEL", orders by sortOrder,
 * manages active slide index state, and provides user-accessible carousel controls.
 */

import { useState, useRef, type KeyboardEvent, type TouchEvent } from "react";
import type { HomeMedia } from "../../types/site";

type HomeHeroCarouselProps = {
  media: HomeMedia[];
};

export function HomeHeroCarousel({ media }: HomeHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const slides = media
    .filter((item) => item.category === "HERO_CAROUSEL")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (slides.length === 0) {
    return null;
  }

  // Ensure currentIndex stays within bounds if slides array updates
  const activeIndex = currentIndex >= slides.length ? 0 : currentIndex;
  const currentItem = slides[activeIndex];
  const hasMultiple = slides.length > 1;

  // Wrap-around index navigation for cyclic carousel browsing
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
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
      className="home-hero-carousel"
      aria-label="Featured showcase carousel"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="home-hero-carousel-header">
        <h2>Featured Showcase</h2>
        {hasMultiple && (
          <span
            className="home-hero-carousel-counter"
            aria-live="polite"
            aria-atomic="true"
          >
            {activeIndex + 1} / {slides.length}
          </span>
        )}
      </div>

      <div className="home-hero-carousel-stage">
        <article
          key={currentItem.id}
          className="home-hero-carousel-item"
          aria-roledescription="slide"
          aria-label={`Slide ${activeIndex + 1} of ${slides.length}`}
        >
          {currentItem.type === "IMAGE" && (
            <img
              src={currentItem.thumbnailUrl ?? currentItem.url}
              alt={
                currentItem.altText ??
                currentItem.title ??
                "Featured showcase"
              }
            />
          )}

          {currentItem.type === "VIDEO" && (
            <video
              src={currentItem.url}
              controls
              preload="metadata"
              aria-label={
                currentItem.altText ?? currentItem.title ?? "Showcase video"
              }
            />
          )}

          {currentItem.type === "DOCUMENT" && (
            <p>
              <a
                href={currentItem.url}
                target="_blank"
                rel="noreferrer"
              >
                Open document ({currentItem.title ?? "Showcase document"})
              </a>
            </p>
          )}

          {currentItem.title && (
            <div className="home-hero-carousel-caption">
              <h3>{currentItem.title}</h3>
            </div>
          )}
        </article>
      </div>

      {hasMultiple && (
        <div
          className="home-hero-carousel-controls"
          aria-label="Carousel navigation"
        >
          <button
            type="button"
            className="home-hero-carousel-btn"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            ‹ Previous
          </button>

          <span
            className="home-hero-carousel-counter-mobile"
            aria-hidden="true"
          >
            {activeIndex + 1} / {slides.length}
          </span>

          <button
            type="button"
            className="home-hero-carousel-btn"
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