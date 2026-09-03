/*
 * PURPOSE:
 * Conversational zero-matches recovery actions component.
 *
 * FLOW:
 * Public Search Flow: SearchAssistant -> SearchAssistantEmptyState.
 *
 * RESPONSIBILITY:
 * Provides concise assistant guidance and targeted recovery shortcuts based only
 * on active query filters, plus a clean "Start over" reset button.
 */

import type { PropertySearchQuery } from "../../services/query-builder";

type SearchAssistantEmptyStateProps = {
  query?: PropertySearchQuery;
  onRemoveAttribute: (key: keyof PropertySearchQuery) => void;
  onReset: () => void;
};

export function SearchAssistantEmptyState({
  query,
  onRemoveAttribute,
  onReset,
}: SearchAssistantEmptyStateProps) {
  const hasBhk = query?.bhk !== undefined;
  const hasLocation = Boolean(query?.locationSlug);
  const hasPrice = Boolean(query?.maxPrice);
  const hasDeveloper = Boolean(query?.developerSlug);
  const hasStatus = Boolean(query?.projectStatus);
  const hasAvailability = Boolean(query?.availabilityStatus);

  return (
    <div className="assistant-empty-state">
      <div className="assistant-empty-bubble">
        <p>That combination isn't available right now.</p>
        <p className="bubble-paragraph-spaced">Let's loosen one choice and try again.</p>
      </div>

      <div className="assistant-recovery-actions">
        {hasPrice && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("maxPrice")}
            className="rule-option-btn rule-option-btn--list recovery-action-btn"
          >
            <span className="rule-option-label">Adjust budget</span>
            <span className="rule-option-arrow" aria-hidden="true">↺</span>
          </button>
        )}

        {hasLocation && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("locationSlug")}
            className="rule-option-btn rule-option-btn--list recovery-action-btn"
          >
            <span className="rule-option-label">Try all locations</span>
            <span className="rule-option-arrow" aria-hidden="true">↺</span>
          </button>
        )}

        {hasBhk && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("bhk")}
            className="rule-option-btn rule-option-btn--list recovery-action-btn"
          >
            <span className="rule-option-label">Any configuration</span>
            <span className="rule-option-arrow" aria-hidden="true">↺</span>
          </button>
        )}

        {hasDeveloper && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("developerSlug")}
            className="rule-option-btn rule-option-btn--list recovery-action-btn"
          >
            <span className="rule-option-label">Any developer</span>
            <span className="rule-option-arrow" aria-hidden="true">↺</span>
          </button>
        )}

        {hasStatus && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("projectStatus")}
            className="rule-option-btn rule-option-btn--list recovery-action-btn"
          >
            <span className="rule-option-label">Any project status</span>
            <span className="rule-option-arrow" aria-hidden="true">↺</span>
          </button>
        )}

        {hasAvailability && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("availabilityStatus")}
            className="rule-option-btn rule-option-btn--list recovery-action-btn"
          >
            <span className="rule-option-label">Any availability</span>
            <span className="rule-option-arrow" aria-hidden="true">↺</span>
          </button>
        )}
      </div>

      <div className="assistant-controls-row">
        <span />
        <button
          type="button"
          onClick={onReset}
          className="assistant-control-btn assistant-control-btn--reset"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
