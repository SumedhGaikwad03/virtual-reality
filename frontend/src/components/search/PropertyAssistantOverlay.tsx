/*
 * PURPOSE:
 * Application-wide floating overlay / mobile bottom sheet for Property Discovery Assistant.
 *
 * FLOW:
 * Application Root Layout -> PropertyAssistantOverlay -> SearchAssistant.
 *
 * RESPONSIBILITY:
 * Renders the assistant overlay panel on desktop and mobile bottom sheet with backdrop click-to-close,
 * keyboard accessibility, close button X, and direct navigation transition to /search results.
 */

import { useNavigate } from "react-router-dom";
import { useAssistant } from "../../context/AssistantContext";
import { SearchAssistant } from "./SearchAssistant";
import { TaraAvatar } from "./TaraAvatar";

export function PropertyAssistantOverlay() {
  const { isOpen, closeAssistant, searchChat } = useAssistant();
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  function handleViewResults() {
    closeAssistant({ reset: false });
    navigate("/search");
  }

  const matchesCount = searchChat.state ? searchChat.state.matches.length : 0;

  return (
    <div className="assistant-overlay-backdrop" onClick={closeAssistant}>
      <div
        className="assistant-overlay-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tara · Property Discovery Advisor"
      >
        <div className="assistant-overlay-header-bar">
          <div className="assistant-overlay-identity">
            <TaraAvatar size="sm" />
            <div className="assistant-overlay-identity-text">
              <span className="assistant-overlay-name">Tara</span>
              <span className="assistant-overlay-role">Property Discovery Advisor</span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAssistant}
            className="assistant-overlay-close-btn"
            aria-label="Close Tara assistant"
          >
            ✕
          </button>
        </div>

        <div className="assistant-overlay-content">
          <SearchAssistant {...searchChat} />

          {matchesCount > 0 && (
            <div className="assistant-overlay-footer-action">
              <button
                type="button"
                onClick={handleViewResults}
                className="view-results-overlay-btn"
              >
                View {matchesCount} Matching {matchesCount === 1 ? "Home" : "Homes"} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
