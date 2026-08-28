/*
 * PURPOSE:
 * Guided interactive property search builder UI.
 *
 * FLOW:
 * Guided Search Discovery Flow
 *
 * RESPONSIBILITY:
 * Renders the multi-turn conversational question-and-answer interface for property discovery,
 * allowing users to select preference options, view matching properties, undo previous answers, or reset.
 */

import { useSearchChat } from "../../hooks/useSearchChat";
import { PropertyResultCard } from "./PropertyResultCard";

export function PropertySearchBuilder() {
  const {
    catalog,
    state,
    messages,
    isLoading,
    error,
    goBack,
    selectOption,
    reset,
  } = useSearchChat();

  if (isLoading) {
    return <p>Loading property search...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!state) {
    return null;
  }

  // Generates dynamic question options based on remaining candidate properties in the catalog
  const options = state.nextRule
    ? state.nextRule.getOptions(catalog, state.query)
    : [];

  return (
    <section className="search-chat">
      {/* Conversational message history */}
      <div className="search-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`search-chat-message ${message.role}`}
          >
            <p>{message.text}</p>
          </div>
        ))}
      </div>

      {/* Dynamic options for the current active question rule */}
      {state.nextRule && options.length > 0 && (
        <div className="search-chat-options">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectOption(option.value, option.label)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Property results displayed when search criteria are sufficiently narrowed or completed */}
      {state.isReady && (
        <section className="search-chat-results">
          <h2>Properties matching your search</h2>

          <div className="property-result-list">
            {state.matches.map(({ project, configuration }) => (
              <PropertyResultCard
                key={`${project.id}-${configuration.id}`}
                project={project}
                configuration={configuration}
              />
            ))}
          </div>
        </section>
      )}

      {/* Navigation and reset controls */}
      <div className="search-chat-controls">
        {messages.length > 1 && (
          <button type="button" onClick={goBack}>
            Change previous answer
          </button>
        )}

        <button type="button" onClick={reset}>
          Start over
        </button>
      </div>
    </section>
  );
}