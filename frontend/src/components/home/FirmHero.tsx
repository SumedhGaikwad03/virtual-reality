import type { Site } from "../../types/site";

type FirmHeroProps = {
  site: Site;
};

export function FirmHero({ site }: FirmHeroProps) {
  return (
    <header className="firm-hero">
      {site.logoUrl ? (
        <img src={site.logoUrl} alt={`${site.name ?? "Firm"} logo`} />
      ) : (
        <div className="firm-logo-fallback" aria-label="Firm logo unavailable">
          {site.name?.slice(0, 1).toUpperCase() ?? "V"}
        </div>
      )}
      <div>
        {site.name && <h1>{site.name}</h1>}
        {site.tagline && <p>{site.tagline}</p>}
        {site.description && <p>{site.description}</p>}
      </div>
    </header>
  );
}
