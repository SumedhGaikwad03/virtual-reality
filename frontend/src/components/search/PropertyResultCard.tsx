/*
 * PURPOSE:
 * Guided search property result card component.
 *
 * FLOW:
 * Guided Search Presentation Flow
 *
 * RESPONSIBILITY:
 * Renders a summary card for a matching project and configuration from the search catalog,
 * providing deep-link navigation directly to the project page with the configuration preselected.
 */

import { Link } from "react-router-dom";
import type {
  SearchCatalogProject,
  SearchCatalogConfiguration,
} from "../../types/search-catalog";

type PropertyResultCardProps = {
  project: SearchCatalogProject;
  configuration: SearchCatalogConfiguration;
};

export function PropertyResultCard({
  project,
  configuration,
}: PropertyResultCardProps) {
  return (
    <article className="property-result-card">
      <header className="property-result-card-header">
        <div>
          <h3>{project.name}</h3>
          <p>{project.location.name}</p>
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
          <strong>₹{configuration.priceFrom}</strong>
        </div>

        <div>
          <span>Availability</span>
          <strong>
            {configuration.availabilityStatus.replace("_", " ")}
          </strong>
        </div>
      </div>

      <footer className="property-result-card-footer">
        {/* Deep-links directly to the public project page with the configuration preselected in the URL */}
        <Link
          to={`/${project.developer.slug}/${project.location.slug}/${project.slug}?configuration=${configuration.id}`}
        >
          View Project
        </Link>
      </footer>
    </article>
  );
}