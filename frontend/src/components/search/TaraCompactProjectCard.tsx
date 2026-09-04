/*
 * PURPOSE:
 * Compact, premium project summary card rendered directly inside Tara conversational search flow.
 *
 * FLOW:
 * Guided Search Lifecycle: SearchAssistant -> TaraCompactProjectCard -> Canonical Project Page.
 *
 * RESPONSIBILITY:
 * Displays a streamlined project summary (name, location, developer, starting price, status, BHKs)
 * for 1-2 search results with direct canonical navigation.
 */

import { Link } from "react-router-dom";
import type {
  SearchCatalogProject,
  SearchCatalogConfiguration,
} from "../../types/search-catalog";
import { formatPrice } from "../../services/query-builder";

type TaraCompactProjectCardProps = {
  project: SearchCatalogProject;
  matchingConfigurations?: SearchCatalogConfiguration[];
  onNavigate?: () => void;
};

export function TaraCompactProjectCard({
  project,
  matchingConfigurations = [],
  onNavigate,
}: TaraCompactProjectCardProps) {
  // Determine relevant configurations (matching subset or all project configurations)
  const configs =
    matchingConfigurations.length > 0
      ? matchingConfigurations
      : project.configurations;

  // Derive minimum starting price
  const minPrice =
    configs.length > 0
      ? configs.reduce((min, c) => {
          const price = BigInt(c.priceFrom);
          return price < min ? price : min;
        }, BigInt(configs[0].priceFrom))
      : undefined;

  // Derive unique BHKs available
  const bhkSet = new Set(configs.map((c) => c.bhk));
  const sortedBhks = [...bhkSet].sort((a, b) => a - b);
  const bhkSummary =
    sortedBhks.length > 0 ? `${sortedBhks.join(", ")} BHK` : undefined;

  // Format project construction/possession status
  const formatStatus = (status: string) => {
    switch (status) {
      case "READY_TO_MOVE":
        return "Ready to Move";
      case "ONGOING":
        return "Under Construction";
      case "UPCOMING":
        return "New Launch";
      case "COMPLETED":
        return "Completed";
      default:
        return status ? status.replaceAll("_", " ") : "Residential";
    }
  };

  // Determine canonical project target URL
  const singleConfig = configs.length === 1 ? configs[0] : undefined;
  const targetUrl = singleConfig
    ? `/${project.developer.slug}/${project.location.slug}/${project.slug}?configuration=${singleConfig.id}`
    : `/${project.developer.slug}/${project.location.slug}/${project.slug}`;

  return (
    <article className="tara-compact-project-card" aria-label={project.name}>
      {/* Visual media / architectural thumbnail */}
      <div className="tara-compact-project-media">
        <div className="tara-compact-media-fallback" aria-hidden="true">
          <span className="tara-compact-media-monogram">
            {project.name.charAt(0)}
          </span>
          <span className="tara-compact-media-tag">
            {project.location.name}
          </span>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="tara-compact-project-body">
        <div className="tara-compact-project-header">
          <div className="tara-compact-title-group">
            <h3 className="tara-compact-project-name">{project.name}</h3>
            <p className="tara-compact-location-dev">
              <span>{project.location.name}</span>
              <span className="tara-compact-bullet">·</span>
              <span>{project.developer.name}</span>
            </p>
          </div>
          <span className="tara-compact-status-badge">
            {formatStatus(project.status)}
          </span>
        </div>

        <div className="tara-compact-project-specs">
          {bhkSummary && (
            <span className="tara-compact-spec-pill">{bhkSummary}</span>
          )}
          {minPrice !== undefined && (
            <span className="tara-compact-price-tag">
              Starting {formatPrice(minPrice)}
            </span>
          )}
        </div>

        <div className="tara-compact-project-footer">
          <Link
            to={targetUrl}
            onClick={onNavigate}
            className="tara-compact-view-link"
          >
            <span>Explore Project</span>
            <span className="tara-compact-link-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
