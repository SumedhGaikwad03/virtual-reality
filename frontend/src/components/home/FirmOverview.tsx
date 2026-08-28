/*
 * PURPOSE:
 * Renders the high-level firm/company overview section on the homepage.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Displays the firm's about/description text or falls back to the firm name.
 */

import type { Site } from "../../types/site";

type FirmOverviewProps = {
  site: Site;
};

export function FirmOverview({ site }: FirmOverviewProps) {
  return (
    <section>
      <h2>About</h2>
      {site.description ? <p>{site.description}</p> : <p>{site.name}</p>}
    </section>
  );
}
