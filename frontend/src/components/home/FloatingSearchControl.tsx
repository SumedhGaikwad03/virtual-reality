/*
 * PURPOSE:
 * Persistent global floating "✦ Tara" CTA control component.
 *
 * FLOW:
 * PublicShell -> FloatingSearchControl -> openAssistant().
 *
 * RESPONSIBILITY:
 * Renders a high-affordance, elegant floating action button across all public pages
 * providing instant one-click access to the property discovery advisor overlay.
 */

import { useEffect, useState } from "react";
import { useAssistant } from "../../context/AssistantContext";

export function FloatingSearchControl() {
  const { openAssistant, isOpen } = useAssistant();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // If assistant overlay is currently open, never show prompt
    if (isOpen) {
      setShowPrompt(false);
      return;
    }

    try {
      if (sessionStorage.getItem("vr_tara_prompt_dismissed")) {
        return;
      }
    } catch {
      // sessionStorage unavailable/disabled in restricted context
    }

    // 2-second entrance delay
    const enterTimer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    // Auto-collapse after ~5.5 seconds of display (total 7.5s from mount)
    const exitTimer = setTimeout(() => {
      setShowPrompt(false);
    }, 7500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [isOpen]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPrompt(false);
    try {
      sessionStorage.setItem("vr_tara_prompt_dismissed", "1");
    } catch {
      // ignore
    }
  };

  const handleOpen = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem("vr_tara_prompt_dismissed", "1");
    } catch {
      // ignore
    }
    openAssistant();
  };

  // If assistant overlay is already open, do not show floating trigger
  if (isOpen) {
    return null;
  }

  return (
    <div className="floating-search-control-container">
      {showPrompt && (
        <div
          className="floating-search-prompt-bubble"
          role="status"
          onClick={handleOpen}
        >
          <div className="floating-search-prompt-text">
            <span className="floating-search-prompt-sparkle" aria-hidden="true">✦</span>
            <span>Select preferences to find homes...</span>
          </div>
          <button
            type="button"
            className="floating-search-prompt-close"
            onClick={handleDismiss}
            aria-label="Dismiss suggestion"
            title="Dismiss"
          >
            ×
          </button>
          <div className="floating-search-prompt-arrow" aria-hidden="true" />
        </div>
      )}
      <button
        type="button"
        onClick={handleOpen}
        className="floating-search-btn"
        aria-label="Explore Properties with Tara"
        title="Explore Properties with Tara"
      >
        <span className="floating-search-sparkle" aria-hidden="true">✦</span>
        <span className="floating-search-label">Tara</span>
      </button>
    </div>
  );
}
