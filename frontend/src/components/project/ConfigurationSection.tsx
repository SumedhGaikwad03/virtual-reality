/*
 * PURPOSE:
 * Renders the available property configurations list on the public project page.
 *
 * FLOW:
 * Public Configuration Selection Flow
 *
 * RESPONSIBILITY:
 * Displays BHK unit types, carpet/built-up area, starting price (in paise), availability status,
 * and selection toggle buttons to update the ?configuration=<id> query parameter.
 */

import type { Configuration } from "../../types/project";

type ConfigurationSectionProps = {
  configurations: Configuration[];
  selectedConfigurationId?: string | null;
  onSelectConfiguration?: (id: string) => void;
};

export function ConfigurationSection({
  configurations,
  selectedConfigurationId,
  onSelectConfiguration,
}: ConfigurationSectionProps) {
  return (
    <section>
      <h2>Configurations</h2>
      {configurations.length === 0 ? (
        <p>No configurations available.</p>
      ) : (
        <div className="configuration-list">
          {configurations.map((configuration) => (
            <article
              key={configuration.id}
              className={
                configuration.id === selectedConfigurationId
                  ? "configuration-item selected"
                  : "configuration-item"
              }
            >
              <h3>{configuration.name}</h3>
              <p>BHK: {configuration.bhk}</p>
              <p>Carpet area: {configuration.carpetArea} sq ft</p>
              {configuration.builtUpArea !== null && (
                <p>Built-up area: {configuration.builtUpArea} sq ft</p>
              )}
              {configuration.superBuiltUpArea !== null && (
                <p>
                  Super-built-up area: {configuration.superBuiltUpArea} sq ft
                </p>
              )}
              {/* Starting price is stored in paise and passed as a string from the API */}
              <p>Starting price (paise): {configuration.priceFrom}</p>
              <p>Availability: {configuration.availabilityStatus}</p>

              {/* Toggles the ?configuration=<id> search parameter on the public ProjectPage */}
              {onSelectConfiguration && (
                <button
                  type="button"
                  onClick={() => onSelectConfiguration(configuration.id)}
                >
                  {configuration.id === selectedConfigurationId
                    ? "Selected"
                    : "View floor plans & media"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
