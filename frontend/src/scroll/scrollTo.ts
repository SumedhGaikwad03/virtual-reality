/*
 * PURPOSE:
 * Reusable, unified programmatic scroll utility.
 *
 * RESPONSIBILITY:
 * Dispatches smooth scrolling commands to the active Lenis instance (when mounted on public pages)
 * or falls back to native window.scrollTo / element.scrollIntoView.
 * Calculates dynamic header and sticky navigation offsets from live DOM dimensions.
 */

import type Lenis from "lenis";

// Global singleton reference to the active public Lenis instance
let activeLenisInstance: Lenis | null = null;

export function registerLenisInstance(lenis: Lenis | null): void {
  activeLenisInstance = lenis;
}

export function getActiveLenis(): Lenis | null {
  return activeLenisInstance;
}

/**
 * Calculates current header / sticky navigation height to prevent content occlusion.
 */
export function getStickyNavigationOffset(): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  const globalHeader = document.querySelector<HTMLElement>(".global-header");
  let totalOffset = 0;

  if (globalHeader) {
    const rect = globalHeader.getBoundingClientRect();
    // Use the rendered header height if it is visible
    if (rect.height > 0) {
      totalOffset += rect.height;
    }
  }

  // Account for a small comfort buffer (8px) below sticky elements
  return totalOffset > 0 ? totalOffset + 8 : 0;
}

export interface ScrollOptions {
  offset?: number;
  immediate?: boolean;
  duration?: number;
  onComplete?: () => void;
}

/**
 * Scrolls window or target element smoothly, respecting active Lenis instance and header offset.
 */
export function scrollToElement(
  target: string | HTMLElement,
  options: ScrollOptions = {}
): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const element =
    typeof target === "string" ? document.getElementById(target.replace("#", "")) : target;

  if (!element) {
    return;
  }

  const navOffset = options.offset !== undefined ? options.offset : -getStickyNavigationOffset();

  if (activeLenisInstance) {
    activeLenisInstance.scrollTo(element, {
      offset: navOffset,
      immediate: options.immediate ?? false,
      duration: options.duration,
      onComplete: options.onComplete ? () => options.onComplete?.() : undefined,
    });
  } else {
    // Fallback for environments without active Lenis (e.g. admin or prefers-reduced-motion)
    const elementRect = element.getBoundingClientRect();
    const targetY = window.scrollY + elementRect.top + navOffset;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: options.immediate ? "instant" : "smooth",
    });

    if (options.onComplete) {
      // Approximate fallback callback
      setTimeout(options.onComplete, options.immediate ? 0 : 350);
    }
  }
}

/**
 * Scrolls to the top of the window (position 0).
 */
export function scrollToTop(immediate = false): void {
  if (typeof window === "undefined") {
    return;
  }

  if (activeLenisInstance) {
    activeLenisInstance.scrollTo(0, { immediate });
  } else {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: immediate ? "instant" : "smooth",
    });
  }
}
