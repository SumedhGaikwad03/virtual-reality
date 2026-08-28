/*
 * PURPOSE:
 * Text search results list container component.
 *
 * FLOW:
 * Natural Language Search Presentation Flow
 *
 * RESPONSIBILITY:
 * Handles loading, error, empty, and populated states for direct property search results.
 */

import type { SearchResult } from "../../types/search";
import { SearchResultCard } from "./SearchResultCard";

type SearchResultsProps = {
  query: string;
  results: SearchResult[] | null;
  isSearching: boolean;
  hasError: boolean;
  validationError: string | null;
};

export function SearchResults({
  query,
  results,
  isSearching,
  hasError,
  validationError,
}: SearchResultsProps) {
  if (isSearching) {
    return <p>Searching...</p>;
  }

  if (validationError) {
    return null;
  }

  if (hasError) {
    return <p role="alert">Unable to search properties.</p>;
  }

  if (results === null) {
    return <p>Search for properties by location, BHK, price, or project.</p>;
  }

  if (results.length === 0) {
    return <p>No properties found{query ? ` for "${query}".` : "."}</p>;
  }

  return (
    <section>
      <h2>Search results</h2>
      <div className="property-search-results">
        {results.map((result) => (
          <SearchResultCard
            key={`${result.project.id}-${result.configuration.id}`}
            result={result}
          />
        ))}
      </div>
    </section>
  );
}
