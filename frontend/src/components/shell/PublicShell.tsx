/*
 * PURPOSE:
 * Public Site Shell layout component.
 *
 * FLOW:
 * AppRouter -> PublicShell (Layout Route) -> Outlet (Page Content).
 *
 * RESPONSIBILITY:
 * Shared public shell component rendering the global header, page content outlet,
 * global assistant overlay, global floating assistant CTA, scroll restoration, and smooth page transition wrapper.
 */

import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { GlobalHeader } from "./GlobalHeader";
import { PropertyAssistantOverlay } from "../search/PropertyAssistantOverlay";
import { FloatingSearchControl } from "../home/FloatingSearchControl";
import { ScrollToTop } from "../common/ScrollToTop";
import { SmoothScrollProvider } from "../../scroll/SmoothScrollProvider";
import { AdvisoryPopupModal } from "../common/AdvisoryPopupModal";
import { useAssistant } from "../../context/AssistantContext";
import { AdvisoryProvider, useAdvisory } from "../../context/AdvisoryContext";
import { useSite } from "../home/hooks/useSite";
import "../../styles/advisory-modal.css";

const ADVISORY_SESSION_KEY = "vr_advisory_popup_shown";

function PublicShellInner() {
  const { isAdvisoryOpen, openAdvisory, closeAdvisory } = useAdvisory();
  const { isOpen: isAssistantOpen } = useAssistant();
  const { site } = useSite();
  const location = useLocation();

  // Exactly one 5-second timer per public visitor session
  useEffect(() => {
    try {
      if (sessionStorage.getItem(ADVISORY_SESSION_KEY)) {
        return;
      }
    } catch {
      // Storage access exception fallback
    }

    const timer = setTimeout(() => {
      try {
        if (sessionStorage.getItem(ADVISORY_SESSION_KEY)) {
          return;
        }
        sessionStorage.setItem(ADVISORY_SESSION_KEY, "true");
      } catch {
        // Storage access exception fallback
      }

      // Explicitly exclude owner submission page (/rentals/list-property)
      if (location.pathname === "/rentals/list-property") {
        return;
      }

      // Do not stack over active Tara overlay or contextual enquiry modals
      const hasConflictingModal =
        isAssistantOpen ||
        document.querySelector(".contextual-enquiry-backdrop") !== null;

      if (!hasConflictingModal) {
        openAdvisory();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAssistantOpen, openAdvisory, location.pathname]);

  // Prevent modal stacking if Tara is opened while advisory modal is active
  useEffect(() => {
    if (isAssistantOpen && isAdvisoryOpen) {
      closeAdvisory();
    }
  }, [isAssistantOpen, isAdvisoryOpen, closeAdvisory]);

  return (
    <div className="public-shell-container">
      <ScrollToTop />
      <GlobalHeader />
      <div className="public-shell-content">
        <div className="page-transition-wrapper">
          <Outlet />
        </div>
      </div>
      <FloatingSearchControl />
      <PropertyAssistantOverlay />
      <AdvisoryPopupModal
        isOpen={isAdvisoryOpen}
        onClose={closeAdvisory}
        site={site}
      />
    </div>
  );
}

export function PublicShell() {
  return (
    <SmoothScrollProvider>
      <AdvisoryProvider>
        <PublicShellInner />
      </AdvisoryProvider>
    </SmoothScrollProvider>
  );
}


