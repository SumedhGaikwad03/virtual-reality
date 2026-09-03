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

import { useState, useRef, useEffect, type KeyboardEvent, type TouchEvent } from "react";
import type { Media } from "../../types/project";

type ProjectHeroCarouselProps = {
  media: Media[];
};

export function ProjectHeroCarousel({ media }: ProjectHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const carouselItems = media
    .filter((item) => item.category === "HERO_CAROUSEL")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hasMultiple = carouselItems.length > 1;
  const activeIndex = currentIndex >= carouselItems.length ? 0 : currentIndex;

  // Preload the next slide image for seamless transitions
  useEffect(() => {
    if (!hasMultiple || carouselItems.length === 0) return;
    const nextIndex = (activeIndex + 1) % carouselItems.length;
    const nextItem = carouselItems[nextIndex];
    if (nextItem && nextItem.type === "IMAGE" && nextItem.url) {
      const img = new Image();
      img.src = nextItem.url;
    }
  }, [activeIndex, hasMultiple, carouselItems]);

  // Handle document visibility change (pause autoplay when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Auto-rotation with pause on hover/focus/tab-hidden and respects prefers-reduced-motion
  useEffect(() => {
    if (!hasMultiple || isPaused) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
    }, 5500);

    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, carouselItems.length]);

  if (carouselItems.length === 0) {
    return null;
  }

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

  const formattedCurrent = String(activeIndex + 1).padStart(2, "0");
  const formattedTotal = String(carouselItems.length).padStart(2, "0");

  return (
    <section
      id="project-featured-showcase-heading"
      className="project-hero-carousel"
      aria-label="Project Hero Carousel"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="project-hero-carousel-header">
        <span className="section-eyebrow">FEATURED SHOWCASE</span>
        <h2>Architectural Highlights</h2>
      </div>

      <div
        className="project-hero-carousel-stage"
      >
        {carouselItems.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <article
              key={item.id}
              className={`project-hero-carousel-item ${isActive ? "active-slide" : "inactive-slide"}`}
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${carouselItems.length}`}
              aria-hidden={!isActive}
            >
              {item.type === "IMAGE" && (
                <img
                  src={item.url}
                  alt={item.altText ?? "Featured showcase image"}
                  className="carousel-slide-image"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              )}

              {item.type === "VIDEO" && (
                <video
                  controls
                  src={item.url}
                  preload="metadata"
                  className="carousel-slide-video"
                  aria-label={item.altText ?? "Featured showcase video"}
                />
              )}

              {item.type === "DOCUMENT" && (
                <div className="carousel-slide-doc">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open document
                  </a>
                </div>
              )}

              {item.title && (
                <div className="project-hero-carousel-caption">
                  <h3>{item.title}</h3>
                </div>
              )}
            </article>
          );
        })}

        {hasMultiple && (
          <>
            <div className="project-carousel-stage-counter" aria-live="polite">
              {formattedCurrent} / {formattedTotal}
            </div>

            <button
              type="button"
              className="project-carousel-floating-btn prev-btn"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              className="project-carousel-floating-btn next-btn"
              onClick={goToNext}
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="carousel-dots-container" aria-label="Slide dots navigation">
          {carouselItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`carousel-dot ${idx === activeIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
