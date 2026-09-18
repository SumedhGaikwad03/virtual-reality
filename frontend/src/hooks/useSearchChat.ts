/*
 * PURPOSE:
 * State management hook for pure rule-based conversational property search discovery.
 *
 * FLOW:
 * Guided Search Lifecycle Flow: AssistantProvider / SearchPage -> useSearchChat.
 *
 * RESPONSIBILITY:
 * Manages search catalog loading, multi-turn query state transitions, option selections,
 * conversation message history, attribute removals, undo (goBack), and reset actions.
 */

import { useEffect, useState } from "react";
import {
  clearSearchCatalogCache,
  loadSearchCatalog,
} from "../services/search-catalog.service";
import {
  applyQueryRule,
  getQueryBuilderState,
  type PropertySearchQuery,
  type QueryBuilderState,
} from "../services/query-builder";
import {
  getTaraIntentOpeningMessage,
  getTaraInitialMessage,
  getTaraResponse,
  getTaraAttributeRemovedMessage,
  type SelectionContext,
} from "../services/assistant-dialogue";
import type { SearchCatalogProject } from "../types/search-catalog";
import type { SearchChatMessage } from "../types/search-chat";

export type DiscoveryIntent = "BUY" | "RENT" | null;

export function useSearchChat(initialIntent: DiscoveryIntent = null) {
  const [catalog, setCatalog] = useState<SearchCatalogProject[]>([]);
  const [queryHistory, setQueryHistory] = useState<PropertySearchQuery[]>([]);
  const [query, setQuery] = useState<PropertySearchQuery>({});
  const [state, setState] = useState<QueryBuilderState | null>(null);
  const [intent, setIntent] = useState<DiscoveryIntent>(initialIntent);
  const [messages, setMessages] = useState<SearchChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function initializeCatalog() {
    setIsLoading(true);
    setError(null);

    loadSearchCatalog()
      .then((loadedCatalog) => {
        const initialState = getQueryBuilderState(loadedCatalog, {});

        setCatalog(loadedCatalog);
        setState(initialState);
        setQuery({});
        setQueryHistory([]);

        if (initialIntent === "BUY") {
          setIntent("BUY");
          if (initialState.nextRule) {
            setMessages([
              {
                id: "initial-question",
                role: "assistant",
                text: getTaraInitialMessage(initialState.nextRule),
              },
            ]);
          }
        } else {
          setIntent(null);
          setMessages([
            {
              id: "intent-greeting",
              role: "assistant",
              text: getTaraIntentOpeningMessage(),
            },
          ]);
        }
      })
      .catch(() => {
        setError("Unable to load property search catalog.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    initializeCatalog();
  }, []);

  function retry() {
    clearSearchCatalogCache();
    initializeCatalog();
  }

  // Advances conversation by applying selected rule option to the query and evaluating the next unresolved rule
  function selectOption(value: string, label: string) {
    if (!state?.nextRule) return;

    const currentRule = state.nextRule;
    setQueryHistory((current) => [...current, query]);

    const nextQuery = applyQueryRule(currentRule, query, value);
    const nextState = getQueryBuilderState(catalog, nextQuery);

    setQuery(nextQuery);
    setState(nextState);

    const selectionContext: SelectionContext = {
      ruleId: currentRule.id,
      value,
      label,
    };

    const assistantReply = getTaraResponse(selectionContext, nextState, catalog);

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: label,
      },
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: assistantReply,
      },
    ]);
  }

  // Removes an individual query constraint and recomputes the rule engine state
  function removeQueryAttribute(key: keyof PropertySearchQuery) {
    const nextQuery = { ...query };
    delete nextQuery[key];
    const nextState = getQueryBuilderState(catalog, nextQuery);

    setQuery(nextQuery);
    setState(nextState);

    const assistantReply = getTaraAttributeRemovedMessage(key, nextState);

    setMessages((current) => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: assistantReply,
      },
    ]);
  }

  // Handles initial intent decision ("BUY" vs "RENT")
  function selectIntent(selectedIntent: "BUY" | "RENT") {
    if (selectedIntent === "BUY") {
      setIntent("BUY");
      const initialState = getQueryBuilderState(catalog, {});
      setQuery({});
      setQueryHistory([]);
      setState(initialState);
      setMessages([
        {
          id: "intent-choice",
          role: "user",
          text: "Buy a home",
        },
        {
          id: "initial-question",
          role: "assistant",
          text: getTaraInitialMessage(initialState.nextRule),
        },
      ]);
    } else {
      setIntent("RENT");
    }
  }

  // Rolls back one question step in the search history
  function goBack() {
    if (queryHistory.length === 0) {
      if (initialIntent === null && intent === "BUY") {
        setIntent(null);
        setQuery({});
        setQueryHistory([]);
        setState(getQueryBuilderState(catalog, {}));
        setMessages([
          {
            id: "intent-greeting",
            role: "assistant",
            text: getTaraIntentOpeningMessage(),
          },
        ]);
      }
      return;
    }

    const previousQuery = queryHistory[queryHistory.length - 1];
    const previousState = getQueryBuilderState(catalog, previousQuery);

    setQuery(previousQuery);
    setState(previousState);
    setQueryHistory((current) => current.slice(0, -1));
    setMessages((current) => current.slice(0, -2));
  }

  // Resets search session back to initial rule question or intent decision
  function reset() {
    const initialState = getQueryBuilderState(catalog, {});

    setQuery({});
    setQueryHistory([]);
    setState(initialState);

    if (initialIntent === "BUY") {
      setIntent("BUY");
      setMessages(
        initialState.nextRule
          ? [
              {
                id: "initial-question",
                role: "assistant",
                text: getTaraInitialMessage(initialState.nextRule),
              },
            ]
          : [],
      );
    } else {
      setIntent(null);
      setMessages([
        {
          id: "intent-greeting",
          role: "assistant",
          text: getTaraIntentOpeningMessage(),
        },
      ]);
    }
  }

  return {
    catalog,
    query,
    state,
    intent,
    messages,
    isLoading,
    error,
    retry,
    selectIntent,
    selectOption,
    removeQueryAttribute,
    goBack,
    reset,
  };
}