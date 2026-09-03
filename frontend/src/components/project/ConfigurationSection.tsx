/*
 * PURPOSE:
 * Renders the available property configurations list on the public project page.
 *
 * FLOW:
 * Public Configuration Selection Flow: ProjectPage -> ConfigurationSection -> ?configuration=<id>.
 *
 * RESPONSIBILITY:
 * Displays BHK unit types, carpet area, starting price (formatted), availability status,
 * and selection toggle buttons to update the ?configuration=<id> query parameter.
 */

import type { Configuration } from "../../types/project";

type ConfigurationSectionProps = {
  configurations: Configuration[];
  selectedConfigurationId?: string | null;
  onSelectConfiguration?: (id: string) => void;
};

function formatPrice(priceFrom: string) {
  try {
    const paise = BigInt(priceFrom || "0");
    const rupees = Number(paise / 100n);
    if (rupees <= 0) return "Price on Request";

    if (rupees >= 10000000) {
      const cr = rupees / 10000000;
      return `₹ ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr+`;
    }
    if (rupees >= 100000) {
      const lakh = rupees / 100000;
      return `₹ ${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} Lakhs+`;
    }
    return `₹ ${rupees.toLocaleString("en-IN")}+`;
  } catch {
    return "Price on Request";
  }
}

function formatStatus(status: string) {
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
}

export function ConfigurationSection({
  configurations,
  selectedConfigurationId,
  onSelectConfiguration,
}: ConfigurationSectionProps) {
  return (
    <section className="project-configurations-section" aria-labelledby="project-configurations-heading">
      <div className="project-configurations-container">
        <span className="section-eyebrow">CONFIGURATIONS & PRICING</span>
        <h2 id="project-configurations-heading" className="project-configurations-title">
          Available Configurations
        </h2>
        <p className="project-configurations-subtitle">
          Select a layout below to view floor plans, unit details, and area specifications.
        </p>

        {configurations.length === 0 ? (
          <div className="zero-configurations-card">
            <h3>Configurations coming soon.</h3>
            <p>Unit pricing and floor plan specifications will be published shortly.</p>
          </div>
        ) : (
          <div className="configuration-grid">
            {configurations.map((config) => {
              const isSelected = config.id === selectedConfigurationId;

              return (
                <article
                  key={config.id}
                  className={`configuration-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="config-card-header">
                    <span className="config-bhk-tag">{config.bhk} BHK</span>
                    <span className={`config-status-badge ${config.availabilityStatus.toLowerCase()}`}>
                      {formatStatus(config.availabilityStatus)}
                    </span>
                  </div>

                  <h3 className="config-name">{config.name}</h3>

                  <div className="config-specs-list">
                    <div className="config-spec-item">
                      <span className="spec-label">Carpet Area</span>
                      <span className="spec-value">{config.carpetArea.toLocaleString()} sq.ft.</span>
                    </div>

                  </div>

                  <div className="config-price-footer">
                    <div>
                      <span className="price-label">Starting Price</span>
                      <div className="config-price">{formatPrice(config.priceFrom)}</div>
                    </div>

                    {onSelectConfiguration && (
                      <button
                        type="button"
                        onClick={() => onSelectConfiguration(config.id)}
                        className={`config-select-btn ${isSelected ? "active" : ""}`}
                      >
                        {isSelected ? "Selected ✓" : "View Details →"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
