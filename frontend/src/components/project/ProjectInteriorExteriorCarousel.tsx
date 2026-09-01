/*
 * PURPOSE:
 * Displays the combined Interior + Exterior visual carousel on the public Project page.
 *
 * FLOW:
 * Public Project Media Narrative: ProjectPage -> ProjectInteriorExteriorCarousel.
 *
 * RESPONSIBILITY:
 * Merges project media with categories "INTERIOR" and "EXTERIOR" into a single rich, near edge-to-edge
 * visual carousel experience with auto-rotation, controls, keyboard navigation, and touch swipe support.
 */

import { useState, useRef, useEffect, type KeyboardEvent, type TouchEvent } from "react";
import type { Media } from "../../types/project";

type ProjectInteriorExteriorCarouselProps = {
  media: Media[];
};

export function ProjectInteriorExteriorCarousel({ media }: ProjectInteriorExteriorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const combinedItems = media
    .filter((item) => item.category === "INTERIOR" || item.category === "EXTERIOR")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hasMultiple = combinedItems.length > 1;
  const activeIndex = currentIndex >= combinedItems.length ? 0 : currentIndex;

  // Preload next slide image
  useEffect(() => {
    if (!hasMultiple || combinedItems.length === 0) return;
    const nextIndex = (activeIndex + 1) % combinedItems.length;
    const nextItem = combinedItems[nextIndex];
    if (nextItem && nextItem.type === "IMAGE" && nextItem.url) {
      const img = new Image();
      img.src = nextItem.url;
    }
  }, [activeIndex, hasMultiple, combinedItems]);

  // Document visibility change (pause autoplay when tab is hidden)
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

  // Auto-rotation every 5.5 seconds with pause on hover/focus and prefers-reduced-motion check
  useEffect(() => {
    if (!hasMultiple || isPaused) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === combinedItems.length - 1 ? 0 : prev + 1));
    }, 5500);

    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, combinedItems.length]);

  if (combinedItems.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? combinedItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === combinedItems.length - 1 ? 0 : prev + 1));
  };

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
      className="project-ie-carousel-section"
      aria-label="Interior and Exterior Visual Story"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="project-ie-carousel-header">
        <span className="section-eyebrow">VISUAL EXPLORATION</span>
        <h2 className="project-ie-carousel-title">Architecture & Interior Spaces</h2>
        <p className="project-ie-carousel-subtitle">
          Here is what the project looks like and what living here feels like.
        </p>
      </div>

      <div
        className="project-ie-carousel-stage"
      >
        {combinedItems.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <article
              key={item.id}
              className={`project-ie-carousel-slide ${isActive ? "active-slide" : "inactive-slide"}`}
              aria-hidden={!isActive}
            >
              {item.type === "IMAGE" && (
                <img
                  src={item.url}
                  alt={item.altText ?? `${item.category} view`}
                  className="project-ie-carousel-image"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              )}

              {item.type === "VIDEO" && (
                <video
                  controls
                  src={item.url}
                  preload="metadata"
                  className="project-ie-carousel-video"
                />
              )}

              <div className="project-ie-carousel-overlay">
                <span className="project-ie-category-tag">
                  {item.category === "INTERIOR" ? "Interior Space" : "Exterior & Architecture"}
                </span>
                {item.title && (
                  <h3 className="project-ie-caption-title">{item.title}</h3>
                )}
              </div>
            </article>
          );
        })}

        {hasMultiple && (
          <>
            <div className="project-carousel-stage-counter" aria-live="polite">
              {String(activeIndex + 1).padStart(2, "0")} / {String(combinedItems.length).padStart(2, "0")}
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
        <div className="carousel-dots-container project-ie-carousel-dots" aria-label="Slide dots navigation">
            {combinedItems.map((item, idx) => (
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
