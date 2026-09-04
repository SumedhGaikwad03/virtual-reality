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

const developerCache = new Map<string, PublicDeveloper>();

export function invalidateDeveloperCache(slug?: string) {
  if (slug) {
    developerCache.delete(slug);
  } else {
    developerCache.clear();
  }
}

export function useDeveloper(developerSlug: string | undefined) {
  const [developer, setDeveloper] = useState<PublicDeveloper | null>(() =>
    developerSlug ? developerCache.get(developerSlug) ?? null : null,
  );
  const [isLoading, setIsLoading] = useState(() =>
    developerSlug ? !developerCache.has(developerSlug) : false,
  );
  const [loadError, setLoadError] = useState<"not-found" | "error" | null>(null);

  useEffect(() => {
    if (!developerSlug) {
      setIsLoading(false);
      setLoadError("error");
      return;
    }

    if (developerCache.has(developerSlug)) {
      setDeveloper(developerCache.get(developerSlug)!);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);
    setDeveloper(null);

    getDeveloper(developerSlug, controller.signal)
      .then((data) => {
        developerCache.set(developerSlug, data);
        setDeveloper(data);
      })
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
