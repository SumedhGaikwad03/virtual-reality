/*
 * PURPOSE:
 * Displays matching property cards below the conversational assistant interface.
 *
 * FLOW:
 * Public Search Flow: SearchPage -> SearchResults -> PropertyResultCard[].
 *
 * RESPONSIBILITY:
 * Renders candidate property result cards when matches exist, communicating distinct project count
 * and total layout count accurately.
 */

import { PropertyResultCard } from "./PropertyResultCard";
import { getUniqueProjects, type filterCatalog } from "../../services/query-builder";

type SearchResultsProps = {
  matches: ReturnType<typeof filterCatalog>;
};

export function SearchResults({ matches }: SearchResultsProps) {
  if (matches.length === 0) {
    return null;
  }

  const uniqueProjects = getUniqueProjects(matches);

  return (
    <section className="search-results-section" aria-label="Matching Property Results">
      <div className="search-results-header">
        <h2 className="search-results-count-title">
          {uniqueProjects.length === 1
            ? `Found 1 matching project (${matches.length} ${matches.length === 1 ? "layout" : "layouts"})`
            : `Found ${uniqueProjects.length} matching projects (${matches.length} ${matches.length === 1 ? "layout" : "layouts"})`}
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
