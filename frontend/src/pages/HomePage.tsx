import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SiteApiError, getSite } from "../api/site";
import { ContactSection } from "../components/home/ContactSection";
import { FeaturedProjects } from "../components/home/FeaturedProjects";
import { FirmHero } from "../components/home/FirmHero";
import { FirmOverview } from "../components/home/FirmOverview";
import type { Site } from "../types/site";

export function HomePage() {
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setHasError(false);

    getSite(controller.signal)
      .then(setSite)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (error instanceof SiteApiError) {
          setHasError(true);
        } else {
          setHasError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (hasError || !site) {
    return <p>Unable to load the site.</p>;
  }

  return (
    <main className="home-page">
      <FirmHero site={site} />
      <FirmOverview site={site} />
      <FeaturedProjects projects={site.featuredProjects} />
      <section>
        <h2>Explore</h2>
        <Link to="/search">Search properties</Link>
      </section>
      <ContactSection contact={site.contact} />
    </main>
  );
}
