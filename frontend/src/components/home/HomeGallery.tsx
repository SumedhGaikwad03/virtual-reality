/*
 * PURPOSE:
 * Displays site-level GALLERY category media as a premium rotating hero-style carousel.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> HomeGallery -> Selected Firm Moments & Achievements.
 *
 * RESPONSIBILITY:
 * Filters active HOME media where category === "GALLERY", orders by sortOrder,
 * and renders a smooth, accessible rotating carousel with pause-on-hover,
 * keyboard accessibility, touch swiping, and reduced-motion support.
 */

import { useEffect, useRef, useState } from "react";
import type { HomeMedia } from "../../types/site";

type HomeGalleryProps = {
  media: HomeMedia[];
};

export function HomeGallery({ media }: HomeGalleryProps) {
  const galleryItems = media
    .filter((item) => item.category === "GALLERY" && item.type === "IMAGE")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const total = galleryItems.length;

  // Auto-advance carousel every 4.5s when not paused and not prefers-reduced-motion
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => clearInterval(timer);
  }, [total, isPaused]);

  if (total === 0) {
    return null;
  }

  const currentItem = galleryItems[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      className="home-firm-gallery-section"
      aria-label="Firm Moments and Gallery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="home-firm-gallery-header">
        <div>
          <span className="firm-gallery-badge">Firm Milestones & Culture</span>
          <h2 className="firm-gallery-title">Moments & Achievements</h2>
          <p className="firm-gallery-subtitle">
            Celebrating milestones, architectural excellence, and leadership across Virtual Reality.
          </p>
        </div>

        {total > 1 && (
          <div className="firm-gallery-nav-controls" role="group" aria-label="Gallery Navigation">
            <button
              type="button"
              onClick={handlePrev}
              className="firm-gallery-nav-btn firm-gallery-nav-btn--prev"
              aria-label="Previous slide"
            >
              ←
            </button>
            <span className="firm-gallery-counter" aria-live="polite">
              {currentIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="firm-gallery-nav-btn firm-gallery-nav-btn--next"
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        )}
      </div>

      <div
        className="firm-gallery-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="firm-gallery-stage">
          {galleryItems.map((item, index) => {
            const isActive = index === currentIndex;
            return (
              <figure
                key={item.id}
                className={`firm-gallery-slide ${isActive ? "is-active" : ""}`}
                aria-hidden={!isActive}
              >
                <img
                  src={item.url}
                  alt={item.altText || item.title || "Virtual Reality Firm Gallery moment"}
                  className="firm-gallery-image"
                  loading={index === 0 ? "eager" : "lazy"}
                />

                {(item.title || item.altText) && (
                  <figcaption className="firm-gallery-caption">
                    {item.title && <h3 className="firm-gallery-caption-title">{item.title}</h3>}
                    {item.altText && <p className="firm-gallery-caption-desc">{item.altText}</p>}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>

        {total > 1 && (
          <div className="firm-gallery-dots" role="tablist" aria-label="Slide indicators">
            {galleryItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Slide ${index + 1}: ${item.title || "Gallery Item"}`}
                className={`firm-gallery-dot ${index === currentIndex ? "is-active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}