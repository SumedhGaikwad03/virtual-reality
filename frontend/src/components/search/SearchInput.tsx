/*
 * PURPOSE:
 * Text search input form component.
 *
 * FLOW:
 * Natural Language Search Flow
 *
 * RESPONSIBILITY:
 * Renders the search query input box and submit button with validation error display.
 */

import type { FormEvent } from "react";

type SearchInputProps = {
  value: string;
  isSearching: boolean;
  validationError: string | null;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SearchInput({
  value,
  isSearching,
  validationError,
  onChange,
  onSubmit,
}: SearchInputProps) {
  return (
    <form className="property-search-form" onSubmit={onSubmit}>
      <label htmlFor="property-search-query">Search properties</label>
      <input
        id="property-search-query"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="3 bhk under 2 crore in pimpri"
      />
      <button type="submit" disabled={isSearching}>
        {isSearching ? "Searching..." : "Search"}
      </button>
      {validationError && <p role="alert">{validationError}</p>}
    </form>
  );
}
