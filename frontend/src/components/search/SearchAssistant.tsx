/*
 * PURPOSE:
 * Core Conversational Property Discovery Assistant container component.
 *
 * FLOW:
 * Public Search Flow: SearchPage / PropertyAssistantOverlay -> SearchAssistant.
 *
 * RESPONSIBILITY:
 * Encapsulates AssistantHeader, ConversationMessages, QuerySummary, RuleOptions,
 * TaraCompactProjectCard (for 1-2 results), and SearchAssistantEmptyState into a
 * pure rule-based conversational interface.
 */

import { useLocation, useNavigate } from "react-router-dom";
import { AssistantHeader } from "./AssistantHeader";
import { ConversationMessages } from "./ConversationMessages";
import { QuerySummary } from "./QuerySummary";
import { RuleOptions } from "./RuleOptions";
import { SearchAssistantEmptyState } from "./SearchAssistantEmptyState";
import { TaraCompactProjectCard } from "./TaraCompactProjectCard";
import { useAssistant } from "../../context/AssistantContext";
import type { useSearchChat } from "../../hooks/useSearchChat";

type SearchAssistantProps = ReturnType<typeof useSearchChat>;

export function SearchAssistant({
  catalog,
  query,
  state,
  messages,
  isLoading,
  error,
  retry,
  selectOption,
  removeQueryAttribute,
  goBack,
  reset,
}: SearchAssistantProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { closeAssistant } = useAssistant();

  if (isLoading) {
    return (
      <section className="search-assistant-card" aria-label="Property Discovery Assistant">
        <AssistantHeader />
        <div className="search-assistant-loading-box">
          <p>Loading available property inventory...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="search-assistant-card" aria-label="Property Discovery Assistant">
        <AssistantHeader />
        <div className="search-assistant-error-box">
          <p className="search-assistant-error-text">{error}</p>
          {retry && (
            <button
              type="button"
              onClick={retry}
              className="rule-option-btn retry-btn"
            >
              Retry
            </button>
          )}
        </div>
      </section>
    );
  }

  if (catalog.length === 0) {
    return (
      <section className="search-assistant-card" aria-label="Property Discovery Assistant">
        <AssistantHeader />
        <div className="search-assistant-empty-catalog-box">
          <p>There are currently no published properties available to explore.</p>
        </div>
      </section>
    );
  }

  if (!state) {
    return null;
  }

  const options = state.nextRule
    ? state.nextRule.getOptions(catalog, state.query)
    : [];

  const isZeroMatches = state.matches.length === 0 && Object.keys(query).length > 0;
  const hasStarted = messages.length > 1;
  const uniqueProjects = state.uniqueProjects;
  const matchesCount = state.matches.length;

  const showCompactCards =
    !isZeroMatches &&
    options.length === 0 &&
    (uniqueProjects.length === 1 || uniqueProjects.length === 2);

  const showViewAllOnly =
    !isZeroMatches &&
    options.length === 0 &&
    uniqueProjects.length >= 3;

  function handleProjectNavigate() {
    closeAssistant({ reset: false });
  }

  function handleViewAllResults() {
    closeAssistant({ reset: false });
    if (location.pathname === "/search") {
      const resultsElem = document.querySelector(".search-results-section");
      if (resultsElem) {
        resultsElem.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/search");
    }
  }

  return (
    <section
      className={`search-assistant-card ${hasStarted ? "search-assistant-card--active" : "search-assistant-card--initial"}`}
      aria-label="Property Discovery Assistant"
    >
      <AssistantHeader />

      <ConversationMessages messages={messages} />

      <QuerySummary
        query={query}
        catalog={catalog}
        onRemoveAttribute={removeQueryAttribute}
        onReset={reset}
      />

      {isZeroMatches ? (
        <SearchAssistantEmptyState
          query={query}
          onRemoveAttribute={removeQueryAttribute}
          onReset={reset}
        />
      ) : showCompactCards ? (
        <div className="tara-compact-results-flow">
          {/* 1 or 2 compact project summary cards directly in conversational flow */}
          <div className="tara-compact-cards-list">
            {uniqueProjects.map((project) => (
              <TaraCompactProjectCard
                key={project.id}
                project={project}
                matchingConfigurations={state.matches
                  .filter((m) => m.project.id === project.id)
                  .map((m) => m.configuration)}
                onNavigate={handleProjectNavigate}
              />
            ))}
          </div>

          {/* Persistent "View All Results" action */}
          <div className="tara-view-all-action">
            <button
              type="button"
              onClick={handleViewAllResults}
              className="tara-view-all-btn"
            >
              <span>
                View All Results ({matchesCount} {matchesCount === 1 ? "layout" : "layouts"})
              </span>
              <span className="tara-view-all-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>

          {/* Previous / Reset controls */}
          <div className="assistant-controls-row">
            {hasStarted ? (
              <button
                type="button"
                onClick={goBack}
                className="assistant-control-btn assistant-control-btn--back"
              >
                ← Previous
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={reset}
              className="assistant-control-btn assistant-control-btn--reset"
            >
              Start over
            </button>
          </div>
        </div>
      ) : showViewAllOnly ? (
        <div className="tara-stopped-results-flow">
          {/* Persistent "View All Results" action for 3+ projects */}
          <div className="tara-view-all-action">
            <button
              type="button"
              onClick={handleViewAllResults}
              className="tara-view-all-btn"
            >
              <span>
                View All {matchesCount} Matching {matchesCount === 1 ? "Home" : "Homes"} across {uniqueProjects.length} Projects
              </span>
              <span className="tara-view-all-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>

          {/* Previous / Reset controls */}
          <div className="assistant-controls-row">
            {hasStarted ? (
              <button
                type="button"
                onClick={goBack}
                className="assistant-control-btn assistant-control-btn--back"
              >
                ← Previous
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={reset}
              className="assistant-control-btn assistant-control-btn--reset"
            >
              Start over
            </button>
          </div>
        </div>
      ) : (
        <RuleOptions
          options={options}
          hasHistory={messages.length > 1}
          onSelectOption={selectOption}
          onGoBack={goBack}
          onReset={reset}
        />
      )}
    </section>
  );
}
