import type { Configuration } from "../../types/project";

type ConfigurationSectionProps = {
  configurations: Configuration[];
  selectedConfigurationId?: string | null;
};

export function ConfigurationSection({
  configurations,
  selectedConfigurationId,
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
              <p>Starting price (paise): {configuration.priceFrom}</p>
              <p>Availability: {configuration.availabilityStatus}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
