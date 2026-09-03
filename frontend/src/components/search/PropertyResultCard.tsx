/*
 * PURPOSE:
 * Guided search property result card component.
 *
 * FLOW:
 * Guided Search Presentation Flow: SearchResults -> PropertyResultCard.
 *
 * RESPONSIBILITY:
 * Renders a summary card for a matching project and configuration from the search catalog,
 * providing clean price formatting (INR) and deep-link navigation directly to the project page
 * with the configuration preselected.
 */

import { Link } from "react-router-dom";
import type {
  SearchCatalogProject,
  SearchCatalogConfiguration,
} from "../../types/search-catalog";
import { formatPrice } from "../../services/query-builder";

type PropertyResultCardProps = {
  project: SearchCatalogProject;
  configuration: SearchCatalogConfiguration;
};

export function PropertyResultCard({
  project,
  configuration,
}: PropertyResultCardProps) {
  const formatAvailability = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Available";
      case "LIMITED":
        return "Limited Units";
      case "SOLD_OUT":
        return "Sold Out";
      default:
        return status;
    }
  };

  return (
    <article className="property-result-card">
      <header className="property-result-card-header">
        <div>
          <h3>{project.name}</h3>
          <p>{project.location.name} · {project.developer.name}</p>
        </div>
      </header>

      <div className="property-result-card-details">
        <div>
          <span>Configuration</span>
          <strong>{configuration.bhk} BHK</strong>
        </div>

        <div>
          <span>Carpet area</span>
          <strong>{configuration.carpetArea} sq ft</strong>
        </div>

        <div>
          <span>Starting price</span>
          <strong>{formatPrice(configuration.priceFrom)}</strong>
        </div>

        <div>
          <span>Availability</span>
          <strong>{formatAvailability(configuration.availabilityStatus)}</strong>
        </div>
      </div>

      <footer className="property-result-card-footer">
        {/* Deep-links directly to the public project page with the configuration preselected in the URL */}
        <Link
          to={`/${project.developer.slug}/${project.location.slug}/${project.slug}?configuration=${configuration.id}`}
        >
          View Project →
        </Link>
      </footer>
    </article>
  );
}