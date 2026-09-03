/*
 * PURPOSE:
 * Core Conversational Property Discovery Assistant container component.
 *
 * FLOW:
 * Public Search Flow: SearchPage -> SearchAssistant.
 *
 * RESPONSIBILITY:
 * Encapsulates AssistantHeader, ConversationMessages, QuerySummary, RuleOptions,
 * and SearchAssistantEmptyState into a pure rule-based conversational interface.
 */

import { AssistantHeader } from "./AssistantHeader";
import { ConversationMessages } from "./ConversationMessages";
import { QuerySummary } from "./QuerySummary";
import { RuleOptions } from "./RuleOptions";
import { SearchAssistantEmptyState } from "./SearchAssistantEmptyState";
import type { useSearchChat } from "../../hooks/useSearchChat";

type SearchAssistantProps = ReturnType<typeof useSearchChat>;

export function SearchAssistant({
  catalog,
  query,
  state,
  messages,
  selectOption,
  removeQueryAttribute,
  goBack,
  reset,
}: SearchAssistantProps) {
  if (!state) {
    return null;
  }

  const options = state.nextRule
    ? state.nextRule.getOptions(catalog, state.query)
    : [];

  const isZeroMatches = state.matches.length === 0 && Object.keys(query).length > 0;

  return (
    <section className="search-assistant-card" aria-label="Property Discovery Assistant">
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
