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
