import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeveloperApiError, getDeveloper } from "../api/developer";
import { DeveloperHeader } from "../components/developer/DeveloperHeader";
import { DeveloperOverview } from "../components/developer/DeveloperOverview";
import { ProjectList } from "../components/developer/ProjectList";
import type { PublicDeveloper } from "../types/developer";

export function DeveloperPage() {
  const { developerSlug } = useParams<{ developerSlug: string }>();
  const [developer, setDeveloper] = useState<PublicDeveloper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<"not-found" | "error" | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    if (!developerSlug) {
      setIsLoading(false);
      setLoadError("error");
      return () => controller.abort();
    }

    setIsLoading(true);
    setLoadError(null);
    setDeveloper(null);

    getDeveloper(developerSlug, controller.signal)
      .then(setDeveloper)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (error instanceof DeveloperApiError && error.status === 404) {
          setLoadError("not-found");
        } else {
          setLoadError("error");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [developerSlug]);

  if (isLoading) {
    return <p>Loading developer...</p>;
  }

  if (loadError === "not-found") {
    return <p>Developer not found.</p>;
  }

  if (loadError || !developer) {
    return <p>Unable to load this developer.</p>;
  }

  return (
    <main className="developer-page">
      <DeveloperHeader developer={developer} />
      <DeveloperOverview developer={developer} />
      <ProjectList
        developerSlug={developer.slug}
        projects={developer.projects}
      />
    </main>
  );
}
