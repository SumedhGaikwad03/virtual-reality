/*
 * PURPOSE:
 * Deterministic Conversational Presentation Layer for Tara (Property Discovery Advisor).
 *
 * FLOW:
 * Guided Search Lifecycle Flow: query-builder -> assistant-dialogue -> useSearchChat -> SearchAssistant UI.
 *
 * RESPONSIBILITY:
 * 1. Generates calm, warm, concise, grounded conversational acknowledgements and questions for Tara.
 * 2. Connects user selections to natural transitions without fabricating facts or simulating fake AI thinking.
 * 3. Communicates stopping states, zero-result guidance, and query acknowledgements deterministically.
 */

import type { PropertySearchQuery, QueryRule, QueryBuilderState } from "./query-builder";
import type { SearchCatalogProject } from "../types/search-catalog";

export type SelectionContext = {
  ruleId: string;
  value: string;
  label: string;
};

/**
 * Initial greeting for Tara on search session start.
 * Kept concise to avoid verbose paragraphs before the first choice.
 */
export function getTaraInitialMessage(firstRule: QueryRule | null): string {
  if (!firstRule) {
    return "Hello, I'm Tara.\nLet's look for your home.\n\nWhat are you looking for?";
  }

  // First rule is typically BHK
  if (firstRule.id === "bhk") {
    return "Hello, I'm Tara.\nLet's look for your home.\n\nWhat are you looking for?";
  }

  return `Hello, I'm Tara.\nLet's look for your home.\n\n${firstRule.question}`;
}

/**
 * Returns conversational acknowledgement and next step guidance after a user selection.
 */
export function getTaraResponse(
  selection: SelectionContext,
  nextState: QueryBuilderState,
  catalog: SearchCatalogProject[],
): string {
  const { query, uniqueProjects, matches, nextRule } = nextState;

  // 1. Zero matches state
  if (matches.length === 0) {
    return "That combination isn't available right now.\n\nLet's loosen one of your choices and try again.";
  }

  // 2. Stopped state (<= 3 unique projects or no further narrowing rules)
  if (!nextRule || nextState.isReady) {
    if (uniqueProjects.length === 1) {
      const project = uniqueProjects[0];
      const layouts = matches.length;
      return `Looks like we found a match.\n\nHere's ${project.name} in ${project.location.name}:`;
    }

    return `I think we've narrowed it down nicely.\n\nHere are the matching homes:`;
  }

  // 3. Conversational transition to the next rule with grounded acknowledgement
  const ack = getAcknowledgement(selection, query, catalog);
  const nextPrompt = getNextRulePrompt(nextRule, query, catalog, selection);

  return `${ack}\n\n${nextPrompt}`;
}

/**
 * Grounded acknowledgement of the user's immediate selection.
 */
function getAcknowledgement(
  selection: SelectionContext,
  query: PropertySearchQuery,
  catalog: SearchCatalogProject[],
): string {
  switch (selection.ruleId) {
    case "bhk":
      return `${selection.label}, got it.`;

    case "location": {
      const locName =
        catalog.find((p) => p.location.slug === selection.value)?.location.name ||
        selection.label;
      return `${locName}, nice choice.`;
    }

    case "project-status": {
      if (selection.value === "READY_TO_MOVE") {
        return "Ready-to-move properties, noted.";
      }
      if (selection.value === "ONGOING") {
        return "Under-construction properties, noted.";
      }
      if (selection.value === "UPCOMING") {
        return "New launch developments, noted.";
      }
      return `${selection.label}, noted.`;
    }

    case "price":
      return `Budget noted.`;

    case "developer": {
      if (selection.value === "__ANY_DEVELOPER__") {
        return "Open to all developers, got it.";
      }
      const devName =
        catalog.find((p) => p.developer.slug === selection.value)?.developer.name ||
        selection.label;
      return `${devName}, noted.`;
    }

    case "availability":
      return `${selection.label} units, noted.`;

    default:
      return `${selection.label}, noted.`;
  }
}

/**
 * Contextual question prompt for the next unresolved rule.
 */
function getNextRulePrompt(
  nextRule: QueryRule,
  query: PropertySearchQuery,
  catalog: SearchCatalogProject[],
  selection?: SelectionContext,
): string {
  switch (nextRule.id) {
    case "bhk":
      return "What kind of home are you looking for?";

    case "location":
      return "Let's see where those homes are available.";

    case "price":
      return "Let's narrow it down by budget.";

    case "project-status":
      return "Would you prefer ready-to-move or under-construction options?";

    case "developer":
      return "Any developer you're particularly interested in?";

    case "availability":
      return "What availability status are you looking for?";

    default:
      return nextRule.question;
  }
}

/**
 * Acknowledgement when a user removes a specific query attribute from QuerySummary.
 */
export function getTaraAttributeRemovedMessage(
  key: keyof PropertySearchQuery,
  nextState: QueryBuilderState,
): string {
  const { uniqueProjects, matches, nextRule } = nextState;

  if (matches.length === 0) {
    return "That combination isn't available right now.\n\nLet's loosen one of your choices and try again.";
  }

  if (!nextRule || nextState.isReady) {
    return `I think we've narrowed it down nicely.\n\nHere are the matching homes:`;
  }

  return `Got it, I've adjusted your search.\n\n${nextRule.question}`;
}
