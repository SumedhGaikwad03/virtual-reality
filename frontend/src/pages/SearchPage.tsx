/*
 * PURPOSE:
 * Public property search page.
 *
 * FLOW:
 * Guided Search Discovery Flow
 *
 * RESPONSIBILITY:
 * Thin page orchestrator mounting the interactive guided property search builder.
 */

import { PropertySearchBuilder } from "../components/search/PropertySearchBuilder";

export function SearchPage() {
  return (
    <main className="search-page">
      <header>
        <h1>Find Your Property</h1>
        <p>Tell us what you're looking for.</p>
      </header>

      <PropertySearchBuilder />
    </main>
  );
}