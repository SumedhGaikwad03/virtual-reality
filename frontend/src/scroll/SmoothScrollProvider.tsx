/*
 * PURPOSE:
 * Lenis Smooth Scroll Provider for public website.
 *
 * FLOW:
 * AppRouter -> PublicShell -> SmoothScrollProvider -> Page Content Outlet.
 *
 * RESPONSIBILITY:
 * Initializes and manages the lifecycle of the Lenis instance on the public layout only.
 * Disables smooth scrolling when prefers-reduced-motion is requested.
 * Preserves native mobile touch physics (syncTouch: false).
 * Provides a context and hook for accessing scroll control functions.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  registerLenisInstance,
  scrollToElement,
  scrollToTop as scrollToTopUtil,
  type ScrollOptions,
} from "./scrollTo";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement, options?: ScrollOptions) => void;
  scrollToTop: (immediate?: boolean) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: scrollToElement,
  scrollToTop: scrollToTopUtil,
  stop: () => {},
  start: () => {},
});

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      registerLenisInstance(null);
      setLenisInstance(null);
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false, // Maintain native touch physics on mobile
      autoRaf: true,
      autoToggle: true,
    });

    registerLenisInstance(lenis);
    setLenisInstance(lenis);

    // Listen for changes in prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        lenis.destroy();
        registerLenisInstance(null);
        setLenisInstance(null);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionPreferenceChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
      }
      registerLenisInstance(null);
      lenis.destroy();
    };
  }, []);

  const value: SmoothScrollContextValue = {
    lenis: lenisInstance,
    scrollTo: scrollToElement,
    scrollToTop: scrollToTopUtil,
    stop: () => {
      lenisInstance?.stop();
    },
    start: () => {
      lenisInstance?.start();
    },
  };

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
