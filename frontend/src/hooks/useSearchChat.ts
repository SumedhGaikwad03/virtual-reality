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

    // Loads public search catalog and initializes initial question rule state
    loadSearchCatalog()
      .then((loadedCatalog) => {
        if (!active) return;

        const initialState = getQueryBuilderState(loadedCatalog, {});

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
          setError("Unable to load property search catalog.");
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

  // Advances conversation by applying selected rule option to the query and evaluating the next unresolved rule
  function selectOption(value: string, label: string) {
    if (!state?.nextRule) return;

    setQueryHistory((current) => [...current, query]);

    const nextQuery = applyQueryRule(state.nextRule, query, value);
    const nextState = getQueryBuilderState(catalog, nextQuery);

    setQuery(nextQuery);
    setState(nextState);

    let assistantReply = "";
    if (nextState.nextRule) {
      assistantReply = nextState.nextRule.question;
    } else if (nextState.uniqueProjects.length === 0) {
      assistantReply = "No properties match those choices right now.";
    } else if (nextState.uniqueProjects.length === 1) {
      assistantReply = "I found 1 matching project for your search.";
    } else {
      assistantReply = `Here are ${nextState.uniqueProjects.length} matching projects (${nextState.matches.length} ${
        nextState.matches.length === 1 ? "layout" : "layouts"
      }).`;
    }

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

    let assistantReply = "";
    if (nextState.nextRule) {
      assistantReply = nextState.nextRule.question;
    } else if (nextState.uniqueProjects.length === 0) {
      assistantReply = "No properties match those choices right now.";
    } else if (nextState.uniqueProjects.length === 1) {
      assistantReply = "I found 1 matching project for your search.";
    } else {
      assistantReply = `Here are ${nextState.uniqueProjects.length} matching projects (${nextState.matches.length} ${
        nextState.matches.length === 1 ? "layout" : "layouts"
      }).`;
    }

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
    if (queryHistory.length === 0) return;

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
    selectOption,
    removeQueryAttribute,
    goBack,
    reset,
  };
}