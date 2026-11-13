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

import { useEffect, useRef, useState } from "react";
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
  getTaraInitialMessage,
  getTaraResponse,
  getTaraAttributeRemovedMessage,
  type SelectionContext,
} from "../services/assistant-dialogue";
import type { SearchCatalogProject } from "../types/search-catalog";
import type { SearchChatMessage } from "../types/search-chat";

export type UseSearchChatOptions = {
  autoInitialize?: boolean;
};

export function useSearchChat(options: UseSearchChatOptions = {}) {
  const { autoInitialize = false } = options;

  const [catalog, setCatalog] = useState<SearchCatalogProject[]>([]);
  const [queryHistory, setQueryHistory] = useState<PropertySearchQuery[]>([]);
  const [query, setQuery] = useState<PropertySearchQuery>({});
  const [state, setState] = useState<QueryBuilderState | null>(null);
  const [messages, setMessages] = useState<SearchChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(autoInitialize);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // In-flight promise ref to deduplicate concurrent initialization triggers within hook instance
  const initPromiseRef = useRef<Promise<void> | null>(null);

  function initializeCatalog(): Promise<void> {
    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    setIsLoading(true);
    setError(null);

    const promise = loadSearchCatalog()
      .then((loadedCatalog) => {
        const initialState = getQueryBuilderState(loadedCatalog, {});

        setCatalog(loadedCatalog);
        setState(initialState);
        setQuery({});
        setQueryHistory([]);
        setIsInitialized(true);

        if (initialState.nextRule) {
          setMessages([
            {
              id: "initial-question",
              role: "assistant",
              text: getTaraInitialMessage(initialState.nextRule),
            },
          ]);
        } else {
          setMessages([]);
        }
      })
      .catch(() => {
        setError("Unable to load property search catalog.");
      })
      .finally(() => {
        setIsLoading(false);
        initPromiseRef.current = null;
      });

    initPromiseRef.current = promise;
    return promise;
  }

  function ensureInitialized(): Promise<void> {
    if (isInitialized || catalog.length > 0) {
      return Promise.resolve();
    }
    return initializeCatalog();
  }

  useEffect(() => {
    if (autoInitialize) {
      initializeCatalog();
    }
  }, [autoInitialize]);

  function retry() {
    clearSearchCatalogCache();
    setIsInitialized(false);
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

  // Rolls back one question step in the search history
  function goBack() {
    if (queryHistory.length === 0) {
      return;
    }

    const previousQuery = queryHistory[queryHistory.length - 1];
    const previousState = getQueryBuilderState(catalog, previousQuery);

    setQuery(previousQuery);
    setState(previousState);
    setQueryHistory((current) => current.slice(0, -1));
    setMessages((current) => current.slice(0, -2));
  }

  // Resets search session back to initial rule question
  function reset() {
    const initialState = getQueryBuilderState(catalog, {});

    setQuery({});
    setQueryHistory([]);
    setState(initialState);

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
  }

  return {
    catalog,
    query,
    state,
    messages,
    isLoading,
    error,
    isInitialized,
    ensureInitialized,
    retry,
    selectOption,
    removeQueryAttribute,
    goBack,
    reset,
  };
}