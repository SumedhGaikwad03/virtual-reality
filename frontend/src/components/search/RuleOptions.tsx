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

  return (
    <div className="rule-options-container">
      {/* Rule options list */}
      <div className="rule-options-grid" role="group" aria-label="Search options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelectOption(option.value, option.label)}
            className="rule-option-btn"
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Conversational controls */}
      <div className="conversational-controls">
        {hasHistory && (
          <button type="button" onClick={onGoBack} className="control-link-btn">
            ← Change previous answer
          </button>
        )}
        <button type="button" onClick={onReset} className="control-link-btn">
          Start over
        </button>
      </div>
    </div>
  );
}
