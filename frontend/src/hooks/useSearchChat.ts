/*
 * PURPOSE:
 * State management hook for guided conversational property search.
 *
 * FLOW:
 * Guided Search Lifecycle Flow
 *
 * RESPONSIBILITY:
 * Manages asynchronous search catalog loading, multi-turn query state transitions,
 * conversation message history, undo (goBack), and reset actions.
 */

import { useEffect, useState } from "react";
import { loadSearchCatalog } from "../services/search-catalog.service";
import {
  applyQueryRule,
  getQueryBuilderState,
  type PropertySearchQuery,
  type QueryBuilderState,
} from "../services/query-builder";
import type { SearchCatalogProject } from "../types/search-catalog";
import type { SearchChatMessage } from "../types/search-chat";

export function useSearchChat() {
  const [catalog, setCatalog] = useState<SearchCatalogProject[]>([]);
  const [queryHistory, setQueryHistory] = useState<PropertySearchQuery[]>([]);
  const [query, setQuery] = useState<PropertySearchQuery>({});
  const [state, setState] = useState<QueryBuilderState | null>(null);
  const [messages, setMessages] = useState<SearchChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Loads the public search catalog and computes the initial question state
    loadSearchCatalog()
      .then((loadedCatalog) => {
        if (!active) return;

        const initialState = getQueryBuilderState(
          loadedCatalog,
          {},
        );

        setCatalog(loadedCatalog);
        setState(initialState);

        if (initialState.nextRule) {
          setMessages([
            {
              id: "initial-question",
              role: "assistant",
              text: initialState.nextRule.question,
            },
          ]);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load property search.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Advances the conversation by applying the chosen option to the query and evaluating the next rule
  function selectOption(value: string, label: string) {
    if (!state?.nextRule) return;

    // Preserves query history to enable user undo
    setQueryHistory((current) => [...current, query]);

    const nextQuery = applyQueryRule(
      state.nextRule,
      query,
      value,
    );

    const nextState = getQueryBuilderState(
      catalog,
      nextQuery,
    );

    setQuery(nextQuery);
    setState(nextState);

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: label,
      },
      ...(nextState.nextRule
        ? [
            {
              id: `assistant-${Date.now()}`,
              role: "assistant" as const,
              text: nextState.nextRule.question,
            },
          ]
        : [
            {
              id: `assistant-${Date.now()}`,
              role: "assistant" as const,
              text:
                nextState.matches.length > 0
                  ? `I found ${nextState.matches.length} properties matching your preferences.`
                  : "I couldn't find any properties matching those preferences.",
            },
          ]),
    ]);
  }

  // Rolls back one question step in the search history
  function goBack() {
    if (queryHistory.length === 0) return;

    const previousQuery =
      queryHistory[queryHistory.length - 1];

    const previousState = getQueryBuilderState(
      catalog,
      previousQuery,
    );

    setQuery(previousQuery);
    setState(previousState);

    setQueryHistory((current) => current.slice(0, -1));

    // Removes the last user answer and the subsequent assistant prompt from the chat log
    setMessages((current) => {
      const nextMessages = current.slice(0, -2);
      return nextMessages;
    });
  }

  // Resets the search session back to the initial question state
  function reset() {
    const initialState = getQueryBuilderState(
      catalog,
      {},
    );

    setQuery({});
    setQueryHistory([]);
    setState(initialState);

    setMessages(
      initialState.nextRule
        ? [
            {
              id: "initial-question",
              role: "assistant",
              text: initialState.nextRule.question,
            },
          ]
        : [],
    );
  }

  return {
    catalog,
    query,
    state,
    messages,
    isLoading,
    error,
    goBack,
    selectOption,
    reset,
  };
}