import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProperties, SearchApiError } from "../api/search";
import { SearchInput } from "../components/search/SearchInput";
import { SearchResults } from "../components/search/SearchResults";
import type { SearchResult } from "../types/search";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q")?.trim() ?? "";
  const [input, setInput] = useState(queryFromUrl);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setInput(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    const controller = new AbortController();

    if (!queryFromUrl) {
      setResults(null);
      setHasError(false);
      setValidationError(null);
      setIsSearching(false);
      return () => controller.abort();
    }

    setIsSearching(true);
    setHasError(false);
    setValidationError(null);
    setResults(null);

    searchProperties(queryFromUrl, controller.signal)
      .then(setResults)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (error instanceof SearchApiError && error.status === 400) {
          setValidationError("Please enter a valid property search query.");
        } else {
          setHasError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      });

    return () => controller.abort();
  }, [queryFromUrl]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = input.trim();

    if (!trimmedQuery) {
      setValidationError("Enter a property search query.");
      return;
    }

    setValidationError(null);
    setSearchParams({ q: trimmedQuery });
  }

  return (
    <main className="search-page">
      <header>
        <h1>Search properties</h1>
        <p>Find properties by location, BHK, price, or project.</p>
      </header>
      <SearchInput
        value={input}
        isSearching={isSearching}
        validationError={validationError}
        onChange={(value) => {
          setInput(value);
          if (validationError) setValidationError(null);
        }}
        onSubmit={handleSubmit}
      />
      <SearchResults
        query={queryFromUrl}
        results={results}
        isSearching={isSearching}
        hasError={hasError}
        validationError={validationError}
      />
    </main>
  );
}
