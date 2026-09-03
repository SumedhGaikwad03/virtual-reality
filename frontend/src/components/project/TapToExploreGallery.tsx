/*
 * PURPOSE:
 * Interactive "Tap to Explore" gallery viewer modal component for public Project page.
 *
 * FLOW:
 * Public Project Media Narrative: ProjectPage -> TapToExploreGallery.
 *
 * RESPONSIBILITY:
 * Filters the already project-scoped media collection to IMAGE records so every
 * project-owned photo can participate without allowing videos or documents into
 * the photo gallery.
 * Renders a clean preview trigger card. Clicking opens a full-screen lightbox modal
 * with thumbnail strip, prev/next navigation, keyboard support, focus trap, and body scroll lock.
 */

import { useState, useEffect, useRef, type KeyboardEvent, type TouchEvent } from "react";
import type { Media } from "../../types/project";

type TapToExploreGalleryProps = {
  media: Media[];
};

export function TapToExploreGallery({ media }: TapToExploreGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const galleryItems = media
    .filter((item) => item.type === "IMAGE")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const totalItems = galleryItems.length;

  // Focus trap & body scroll locking when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus close button for accessibility
    closeButtonRef.current?.focus();

    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, totalItems]);

  if (totalItems === 0) {
    return null;
  }

  const activeItem = galleryItems[selectedIndex >= totalItems ? 0 : selectedIndex];
  const coverItem = galleryItems[0];

  const handleOpen = () => {
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
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
    <section id="project-gallery-heading" className="tap-to-explore-section" aria-label="Project Gallery Exploration">
      <div className="tap-to-explore-card" onClick={handleOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleOpen()}>
        <div className="tap-to-explore-preview">
          <img src={coverItem.url} alt={coverItem.altText ?? "Project gallery preview"} className="tap-to-explore-cover-img" />
          <div className="tap-to-explore-overlay">
            <span className="tap-to-explore-badge">✦ TAP TO EXPLORE</span>
            <h3 className="tap-to-explore-title">Full Project Gallery</h3>
            <p className="tap-to-explore-count">{totalItems} {totalItems === 1 ? "Photo" : "Photos & Progress Updates"}</p>
            <span className="tap-to-explore-cta">View All Photos →</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="gallery-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Full Project Gallery Lightbox"
        >
          <div className="gallery-modal-container">
            <header className="gallery-modal-header">
              <div className="gallery-modal-info">
                <h2>Project Gallery</h2>
                <span className="gallery-modal-counter">
                  {selectedIndex + 1} of {totalItems}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="gallery-modal-close-btn"
                onClick={handleClose}
                aria-label="Close gallery modal"
              >
                ✕ Close
              </button>
            </header>

            <div
              className="gallery-modal-stage"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {totalItems > 1 && (
                <button
                  type="button"
                  className="gallery-modal-nav-btn prev-btn"
                  onClick={goToPrevious}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
              )}

              <div className="gallery-modal-view">
                {activeItem.type === "IMAGE" && (
                  <img
                    src={activeItem.url}
                    alt={activeItem.altText ?? `Gallery photo ${selectedIndex + 1}`}
                    className="gallery-modal-image"
                  />
                )}

                {activeItem.type === "VIDEO" && (
                  <video
                    controls
                    src={activeItem.url}
                    preload="metadata"
                    className="gallery-modal-video"
                  />
                )}

                {(activeItem.title || activeItem.altText) && (
                  <p className="gallery-modal-caption">
                    {activeItem.title ?? activeItem.altText}
                  </p>
                )}
              </div>

              {totalItems > 1 && (
                <button
                  type="button"
                  className="gallery-modal-nav-btn next-btn"
                  onClick={goToNext}
                  aria-label="Next photo"
                >
                  ›
                </button>
              )}
            </div>

            {totalItems > 1 && (
              <div className="gallery-modal-thumbnails">
                {galleryItems.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`gallery-thumb-btn ${idx === selectedIndex ? "active" : ""}`}
                    onClick={() => setSelectedIndex(idx)}
                    aria-label={`Select photo ${idx + 1}`}
                  >
                    <img src={item.thumbnailUrl ?? item.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
