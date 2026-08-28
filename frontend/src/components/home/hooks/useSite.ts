/*
 * PURPOSE:
 * Custom React hook for fetching and managing public site data.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Encapsulates the asynchronous lifecycle (AbortController, loading, error, and data state)
 * for loading site configuration, home media, and featured projects.
 */

import { useEffect, useState } from "react";
import { SiteApiError, getSite } from "../../../api/site";
import type { Site } from "../../../types/site";

export function useSite() {
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

  return { site, isLoading, hasError };
}
