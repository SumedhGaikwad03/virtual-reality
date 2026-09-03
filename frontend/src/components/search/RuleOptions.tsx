/*
 * PURPOSE:
 * Renders rule-based option buttons for the active conversational question.
 *
 * FLOW:
 * Public Search Flow: SearchAssistant -> RuleOptions.
 *
 * RESPONSIBILITY:
 * Displays selectable options provided by current query rule (BHK, Location, Budget, Status).
 * Every selection updates the search query state and triggers the next rule question.
 */

import type { QueryOption } from "../../services/query-builder";

type RuleOptionsProps = {
  options: QueryOption[];
  hasHistory: boolean;
  onSelectOption: (value: string, label: string) => void;
  onGoBack: () => void;
  onReset: () => void;
};

export function RuleOptions({
  options,
  hasHistory,
  onSelectOption,
  onGoBack,
  onReset,
}: RuleOptionsProps) {
  if (options.length === 0) {
    return null;
  }

  // Detect whether this is a compact set (e.g. 2, 3, 4, 5 BHK) or a list (e.g. locations/developers/budget)
  const isCompactSet = options.length <= 6 && options.every((o) => o.label.length <= 8);

  return (
    <div className="rule-options-container">
      {/* Rule options list */}
      <div
        className={`rule-options-grid ${isCompactSet ? "rule-options-grid--compact" : "rule-options-grid--list"}`}
        role="group"
        aria-label="Search options"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelectOption(option.value, option.label)}
            className={`rule-option-btn ${isCompactSet ? "rule-option-btn--compact" : "rule-option-btn--list"}`}
          >
            <span className="rule-option-label">{option.label}</span>
            {!isCompactSet && (
              <span className="rule-option-arrow" aria-hidden="true">
                →
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Subtle bottom utility row */}
      <div className="assistant-controls-row">
        {hasHistory ? (
          <button
            type="button"
            onClick={onGoBack}
            className="assistant-control-btn assistant-control-btn--back"
          >
            ← Previous
          </button>
        ) : (
          <span />
        )}
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
