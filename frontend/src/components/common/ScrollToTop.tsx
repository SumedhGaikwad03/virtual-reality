/*
 * PURPOSE:
 * Automatic window scroll reset on route changes and hash navigation.
 *
 * FLOW:
 * AppRouter -> PublicShell -> ScrollToTop.
 *
 * RESPONSIBILITY:
 * Resets window scroll position to (0, 0) upon pathname transitions,
 * or scrolls smoothly to anchor elements when hash URLs are targeted.
 */

import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const isPop = navigationType === "POP";
    const pathnameChanged = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    // 1. If a hash anchor is specified (e.g. #about, #contact, #photos), scroll to it
    if (hash) {
      const targetId = hash.replace("#", "");
      let attempts = 0;
      const maxAttempts = 15;

      const scrollInterval = setInterval(() => {
        attempts += 1;
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          clearInterval(scrollInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(scrollInterval);
        }
      }, 40);

      return () => clearInterval(scrollInterval);
    }

    // 2. On POP navigation (browser Back / Forward) without hash:
    // Do NOT force window.scrollTo(0, 0).
    // Let the browser restore its historical scroll position naturally.
    if (isPop) {
      return;
    }

    // 3. On PUSH / REPLACE navigation to a new page without hash:
    // Reset scroll position to top.
    if (pathnameChanged) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, navigationType]);

  return null;
}
