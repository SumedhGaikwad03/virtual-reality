/*
 * PURPOSE:
 * Public developer data-fetching hook.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Encapsulates the asynchronous lifecycle (AbortController, loading, 404 vs error state)
 * for fetching a public developer and their published projects by slug.
 */

import { useEffect, useState } from "react";
import { DeveloperApiError, getDeveloper } from "../../../api/developer";
import type { PublicDeveloper } from "../../../types/developer";

export function useDeveloper(developerSlug: string | undefined) {
  const [developer, setDeveloper] = useState<PublicDeveloper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<"not-found" | "error" | null>(null);

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

  return { developer, isLoading, loadError };
}
