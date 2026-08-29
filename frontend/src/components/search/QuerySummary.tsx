/*
 * PURPOSE:
 * Subtle conversational search context chips component.
 *
 * FLOW:
 * Public Search Flow: SearchAssistant -> QuerySummary.
 *
 * RESPONSIBILITY:
 * Displays active interpreted query constraints (e.g. [3 BHK ×], [Wakad ×], [Under ₹1.5 Cr ×])
 * as subtle conversational chips, allowing users to remove individual constraints.
 */

import type { PropertySearchQuery } from "../../services/query-builder";
import type { SearchCatalogProject } from "../../types/search-catalog";

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
    try {
      const paise = BigInt(query.maxPrice);
      const rupees = Number(paise / 100n);
      const priceText =
        rupees >= 10000000
          ? `Under ₹${(rupees / 10000000).toFixed(1)} Cr`
          : `Under ₹${(rupees / 100000).toFixed(0)} Lakhs`;
      chips.push({ key: "maxPrice", label: priceText });
    } catch {
      chips.push({ key: "maxPrice", label: "Budget filter" });
    }
  }

  if (query.availabilityStatus) {
    chips.push({
      key: "availabilityStatus",
      label: query.availabilityStatus.replace("_", " "),
    });
  }

  if (query.projectStatus) {
    chips.push({
      key: "projectStatus",
      label: query.projectStatus.replaceAll("_", " "),
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
