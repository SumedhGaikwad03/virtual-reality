/*
 * PURPOSE:
 * Conversational zero-matches recovery actions component.
 *
 * FLOW:
 * Public Search Flow: SearchAssistant -> SearchAssistantEmptyState.
 *
 * RESPONSIBILITY:
 * Provides assistant guidance and recovery shortcuts when no properties match the current query.
 */

type SearchAssistantEmptyStateProps = {
  onRemoveAttribute: (key: any) => void;
  onReset: () => void;
};

export function SearchAssistantEmptyState({
  onRemoveAttribute,
  onReset,
}: SearchAssistantEmptyStateProps) {
  return (
    <div className="assistant-empty-state">
      <div className="assistant-empty-bubble">
        <p>
          I couldn't find an exact match for those preferences. We could broaden your search by adjusting budget, location, or unit configuration.
        </p>
      </div>

      <div className="assistant-recovery-actions">
        <button
          type="button"
          onClick={() => onRemoveAttribute("maxPrice")}
          className="recovery-action-btn"
        >
          Broaden budget
        </button>
        <button
          type="button"
          onClick={() => onRemoveAttribute("locationSlug")}
          className="recovery-action-btn"
        >
          Try all locations
        </button>
        <button
          type="button"
          onClick={() => onRemoveAttribute("bhk")}
          className="recovery-action-btn"
        >
          Any configuration
        </button>
        <button
          type="button"
          onClick={onReset}
          className="recovery-reset-btn"
        >
          Reset conversation
        </button>
      </div>
    </div>
  );
}
