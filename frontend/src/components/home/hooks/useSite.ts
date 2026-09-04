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

let cachedSite: Site | null = null;
let inFlightPromise: Promise<Site> | null = null;

export function invalidateSiteCache() {
  cachedSite = null;
}

export function useSite() {
  const [site, setSite] = useState<Site | null>(() => cachedSite);
  const [isLoading, setIsLoading] = useState(() => !cachedSite);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (cachedSite) {
      setSite(cachedSite);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);

    const promise = inFlightPromise ?? getSite(controller.signal);
    inFlightPromise = promise;

    promise
      .then((data) => {
        cachedSite = data;
        setSite(data);
      })
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
        inFlightPromise = null;
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      // If needed controller.abort() when no cache
    };
  }, []);

  return { site, isLoading, hasError };
}
