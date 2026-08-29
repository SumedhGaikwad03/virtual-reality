/*
 * PURPOSE:
 * Displays matching property cards below the conversational assistant interface.
 *
 * FLOW:
 * Public Search Flow: SearchPage -> SearchResults -> PropertyResultCard[].
 *
 * RESPONSIBILITY:
 * Renders candidate property result cards when matches exist and criteria are sufficient.
 */

import { PropertyResultCard } from "./PropertyResultCard";
import type { filterCatalog } from "../../services/query-builder";

type SearchResultsProps = {
  matches: ReturnType<typeof filterCatalog>;
};

export function SearchResults({ matches }: SearchResultsProps) {
  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="search-results-section" aria-label="Matching Property Results">
      <div className="search-results-header">
        <h2 className="search-results-count-title">
          {matches.length === 1
            ? "I found 1 property matching your search."
            : `I found ${matches.length} properties matching your search.`}
        </h2>
      </div>

      <div className="property-result-list">
        {matches.map(({ project, configuration }) => (
          <PropertyResultCard
            key={`${project.id}-${configuration.id}`}
            project={project}
            configuration={configuration}
          />
        ))}
      </div>
    </section>
  );
}
