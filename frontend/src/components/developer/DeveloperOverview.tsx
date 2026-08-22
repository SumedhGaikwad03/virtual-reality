import type { Developer } from "../../types/developer";

type DeveloperOverviewProps = {
  developer: Developer;
};

export function DeveloperOverview({ developer }: DeveloperOverviewProps) {
  return (
    <section>
      <h2>About {developer.name}</h2>
      {developer.description && <p>{developer.description}</p>}
      {developer.websiteUrl && (
        <a href={developer.websiteUrl} target="_blank" rel="noreferrer">
          Visit website
        </a>
      )}
    </section>
  );
}
