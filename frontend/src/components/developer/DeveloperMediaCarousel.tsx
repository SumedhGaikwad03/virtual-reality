/*
 * PURPOSE:
 * Displays the visual showcase media carousel on the public Developer page
 * with near edge-to-edge aspect ratio framing, sleek floating controls, and padded indicators.
 *
 * FLOW:
 * Public Developer Discovery Flow: DeveloperPage -> DeveloperMediaCarousel.
 *
 * RESPONSIBILITY:
 * Filters developer media, orders by sortOrder, renders full-resolution images with 800ms
 * soft crossfade slide transitions, next slide image preloading, visibility change pause,
 * sleek floating circular arrow controls, and padded "01 / 02" counter overlays.
 */

import { useState, useRef, useEffect, type KeyboardEvent, type TouchEvent } from "react";
import type { Media } from "../../types/project";

type DeveloperMediaCarouselProps = {
  media: Media[];
};

function getBoundedAspectRatio(width: number, height: number) {
  if (width <= 0 || height <= 0) return null;
  return Math.min(Math.max(width / height, 0.75), 2.4);
}

export function DeveloperMediaCarousel({ media }: DeveloperMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stageAspectRatio, setStageAspectRatio] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const carouselItems = media
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hasMultiple = carouselItems.length > 1;
  const activeIndex = currentIndex >= carouselItems.length ? 0 : currentIndex;

  const updateStageAspectRatio = (width: number, height: number) => {
    const ratio = getBoundedAspectRatio(width, height);
    if (ratio !== null) setStageAspectRatio(ratio);
  };

  useEffect(() => {
    const activeImage = stageRef.current?.querySelector<HTMLImageElement>(
      ".active-slide img",
    );
    if (activeImage?.complete) {
      updateStageAspectRatio(activeImage.naturalWidth, activeImage.naturalHeight);
    }
  }, [activeIndex]);

  // Preload next slide image for seamless crossfade
  useEffect(() => {
    if (!hasMultiple || carouselItems.length === 0) return;
    const nextIndex = (activeIndex + 1) % carouselItems.length;
    const nextItem = carouselItems[nextIndex];
    if (nextItem && nextItem.type === "IMAGE" && nextItem.url) {
      const img = new Image();
      img.src = nextItem.url;
    }
  }, [activeIndex, hasMultiple, carouselItems]);

  // Pause autoplay when document tab is hidden
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

  // Auto-rotation every 5.5s with pause on hover/focus and prefers-reduced-motion check
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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
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

  const formattedCurrent = String(activeIndex + 1).padStart(2, "0");
  const formattedTotal = String(carouselItems.length).padStart(2, "0");

  return (
    <section
      className="developer-media-carousel-section"
      aria-label="Developer Visual Showcase"
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
      <div className="developer-media-carousel-header">
        <span className="section-eyebrow">FEATURED SHOWCASE</span>
        <h2 className="developer-media-carousel-title">Architectural Highlights</h2>
      </div>

      <div
        ref={stageRef}
        className="developer-media-carousel-stage"
        style={stageAspectRatio ? { aspectRatio: String(stageAspectRatio) } : undefined}
      >
        {carouselItems.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <article
              key={item.id}
              className={`developer-media-carousel-slide ${isActive ? "active-slide" : "inactive-slide"}`}
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${carouselItems.length}`}
              aria-hidden={!isActive}
            >
              {item.type === "IMAGE" && (
                <img
                  src={item.url}
                  alt={item.altText ?? "Developer showcase image"}
                  className="developer-carousel-image"
                  loading={idx === 0 ? "eager" : "lazy"}
                  onLoad={(event) => {
                    if (idx === activeIndex) {
                      updateStageAspectRatio(
                        event.currentTarget.naturalWidth,
                        event.currentTarget.naturalHeight,
                      );
                    }
                  }}
                />
              )}

              {item.type === "VIDEO" && (
                <video
                  controls
                  src={item.url}
                  preload="metadata"
                  className="developer-carousel-video"
                  aria-label={item.altText ?? "Developer showcase video"}
                />
              )}

              {item.title && (
                <div className="developer-media-carousel-caption">
                  <h3>{item.title}</h3>
                </div>
              )}
            </article>
          );
        })}

        {hasMultiple && (
          <>
            {/* Padded Counter Overlay (01 / 02) */}
            <div className="carousel-stage-counter" aria-live="polite">
              {formattedCurrent} / {formattedTotal}
            </div>

            {/* Sleek Floating Arrow Controls */}
            <button
              type="button"
              className="carousel-floating-btn prev-btn"
              onClick={goToPrevious}
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              type="button"
              className="carousel-floating-btn next-btn"
              onClick={goToNext}
              aria-label="Next slide"
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
