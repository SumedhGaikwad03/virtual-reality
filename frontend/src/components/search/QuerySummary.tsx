/*
 * PURPOSE:
 * Subtle conversational search context chips component.
 *
 * FLOW:
 * Public Search Flow: SearchAssistant -> QuerySummary.
 *
 * RESPONSIBILITY:
 * Displays active interpreted query constraints (e.g. [3 BHK ×], [Wakad ×], [Under ₹2 Cr+ ×])
 * as subtle conversational chips, allowing users to remove individual constraints.
 */

import type { PropertySearchQuery } from "../../services/query-builder";
import type { SearchCatalogProject } from "../../types/search-catalog";
import { formatPrice } from "../../services/query-builder";

type QuerySummaryProps = {
  query: PropertySearchQuery;
  catalog: SearchCatalogProject[];
  onRemoveAttribute: (key: keyof PropertySearchQuery) => void;
  onReset: () => void;
};

export function QuerySummary({
  query,
  catalog,
  onRemoveAttribute,
  onReset,
}: QuerySummaryProps) {
  const chips: { key: keyof PropertySearchQuery; label: string }[] = [];

  if (query.bhk) {
    chips.push({ key: "bhk", label: `${query.bhk} BHK` });
  }

  if (query.locationSlug) {
    const locName =
      catalog.find((p) => p.location.slug === query.locationSlug)?.location.name ||
      query.locationSlug;
    chips.push({ key: "locationSlug", label: locName });
  }

  if (query.developerSlug) {
    const devName =
      catalog.find((p) => p.developer.slug === query.developerSlug)?.developer.name ||
      query.developerSlug;
    chips.push({ key: "developerSlug", label: devName });
  }

  if (query.maxPrice) {
    chips.push({ key: "maxPrice", label: `Max ${formatPrice(query.maxPrice)}` });
  }

  if (query.projectStatus) {
    let statusLabel = query.projectStatus;
    switch (query.projectStatus) {
      case "READY_TO_MOVE":
        statusLabel = "Ready to Move";
        break;
      case "ONGOING":
        statusLabel = "Under Construction";
        break;
      case "UPCOMING":
        statusLabel = "New Launch";
        break;
      case "COMPLETED":
        statusLabel = "Completed";
        break;
      default:
        statusLabel = query.projectStatus.replaceAll("_", " ");
    }
    chips.push({
      key: "projectStatus",
      label: statusLabel,
    });
  }

  if (query.availabilityStatus) {
    let availLabel: string = query.availabilityStatus;
    switch (query.availabilityStatus) {
      case "AVAILABLE":
        availLabel = "Available";
        break;
      case "LIMITED":
        availLabel = "Limited Units";
        break;
      case "SOLD_OUT":
        availLabel = "Sold Out";
        break;
    }
    chips.push({
      key: "availabilityStatus",
      label: availLabel,
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="query-summary-container">
      <span className="summary-label">Looking for:</span>
      <div className="summary-chips-list">
        {chips.map((chip) => (
          <span key={chip.key} className="summary-chip">
            <span className="chip-text">{chip.label}</span>
            <button
              type="button"
              onClick={() => onRemoveAttribute(chip.key)}
              className="chip-remove-btn"
              aria-label={`Remove ${chip.label}`}
            >
              ×
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={onReset}
          className="summary-reset-btn"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
