/*
 * PURPOSE:
 * Renders the overview and biography section on the public developer page.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Displays the developer description/bio and outbound official website link.
 */

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
