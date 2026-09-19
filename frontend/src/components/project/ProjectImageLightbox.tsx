/*
 * PURPOSE:
 * Standalone, lightweight, accessible image lightbox modal for inspecting enlarged
 * architectural drawings, floor plans, and location maps on the public Project page.
 *
 * FLOW:
 * Project Page (Floor Plan / Location Map Click) -> ProjectImageLightbox -> View / Close.
 *
 * RESPONSIBILITY:
 * - Renders a focused full-screen dark translucent backdrop.
 * - Displays the image uncropped with preserved aspect ratio (object-fit: contain).
 * - Manages accessible focus, Escape key listener, click-outside dismissal, and body scroll locking.
 */

import { useEffect, useRef } from "react";
import { getOptimizedImageUrl } from "../../utils/image";

type ProjectImageLightboxProps = {
  isOpen: boolean;
  imageUrl: string;
  altText?: string;
  title?: string;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

export function ProjectImageLightbox({
  isOpen,
  imageUrl,
  altText,
  title,
  onClose,
  triggerRef,
}: ProjectImageLightboxProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus close button when opened
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef?.current?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div
      className="project-image-lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || altText || "Enlarged Image Viewer"}
    >
      <div
        ref={containerRef}
        className="project-image-lightbox-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="project-image-lightbox-close-btn"
          onClick={onClose}
          aria-label="Close image viewer"
        >
          <span className="project-image-lightbox-close-icon" aria-hidden="true">✕</span>
          <span className="project-image-lightbox-close-text">Close</span>
        </button>

        <div className="project-image-lightbox-stage">
          <img
            src={getOptimizedImageUrl(imageUrl)}
            alt={altText || title || "Enlarged view"}
            className="project-image-lightbox-img"
          />
        </div>

        {title && (
          <div className="project-image-lightbox-caption">
            <span>{title}</span>
          </div>
        )}
      </div>
    </div>
  );
}
