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
        <p>No properties match those choices right now.</p>
      </div>

      <div className="assistant-recovery-actions">
        {hasPrice && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("maxPrice")}
            className="recovery-action-btn"
          >
            Adjust budget
          </button>
        )}

        {hasLocation && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("locationSlug")}
            className="recovery-action-btn"
          >
            Try all locations
          </button>
        )}

        {hasBhk && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("bhk")}
            className="recovery-action-btn"
          >
            Any configuration
          </button>
        )}

        {hasDeveloper && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("developerSlug")}
            className="recovery-action-btn"
          >
            Any developer
          </button>
        )}

        {hasStatus && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("projectStatus")}
            className="recovery-action-btn"
          >
            Any project status
          </button>
        )}

        {hasAvailability && (
          <button
            type="button"
            onClick={() => onRemoveAttribute("availabilityStatus")}
            className="recovery-action-btn"
          >
            Any availability
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="recovery-reset-btn"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
