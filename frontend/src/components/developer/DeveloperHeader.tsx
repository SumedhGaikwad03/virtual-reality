import type { Developer } from "../../types/developer";

type DeveloperHeaderProps = {
  developer: Developer;
};

export function DeveloperHeader({ developer }: DeveloperHeaderProps) {
  return (
    <header className="developer-header">
      {developer.logoUrl ? (
        <img src={developer.logoUrl} alt={`${developer.name} logo`} />
      ) : (
        <div className="developer-logo-fallback" aria-label="Developer logo unavailable">
          {developer.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div>
        <h1>{developer.name}</h1>
        <p>{developer.slug}</p>
      </div>
    </header>
  );
}
