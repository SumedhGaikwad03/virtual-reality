/*
 * PURPOSE:
 * Renders the overview and biography section on the public developer page.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Displays the developer description/bio without exposing administrative external-link metadata publicly.
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
    </section>
  );
}
