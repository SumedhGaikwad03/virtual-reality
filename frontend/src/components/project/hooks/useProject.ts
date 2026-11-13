/*
 * PURPOSE:
 * Public project data-fetching hook.
 *
 * FLOW:
 * Public Project Discovery Flow
 *
 * RESPONSIBILITY:
 * Encapsulates the asynchronous lifecycle (AbortController, loading state, 404 vs error mapping)
 * for fetching a public project, its configurations, and media by developer, location, and project slugs.
 */

import { useEffect, useState } from "react";
import { getProject, ProjectApiError } from "../../../api/project";
import type { Project } from "../../../types/project";

const projectCache = new Map<string, Project>();

export function invalidateProjectCache(cacheKey?: string) {
  if (cacheKey) {
    projectCache.delete(cacheKey);
  } else {
    projectCache.clear();
  }
}

/**
 * Safely parses and validates server-provided initial project data from <script id="__INITIAL_DATA__">.
 * Ensures the payload matches the expected project cacheKey, prevents reuse of stale data,
 * and removes the DOM attribute after consumption.
 */
function getInitialProjectData(targetCacheKey: string): Project | null {
  if (typeof document === "undefined") {
    return null;
  }

  const scriptEl = document.getElementById("__INITIAL_DATA__");
  if (!scriptEl || !scriptEl.textContent) {
    return null;
  }

  try {
    const raw = JSON.parse(scriptEl.textContent);
    // Remove element id once read so it is consumed only once during initial bootstrap
    scriptEl.removeAttribute("id");

    if (
      typeof raw === "object" &&
      raw !== null &&
      "type" in raw &&
      raw.type === "PROJECT" &&
      "key" in raw &&
      raw.key === targetCacheKey &&
      "data" in raw &&
      typeof raw.data === "object" &&
      raw.data !== null &&
      "id" in raw.data &&
      "name" in raw.data &&
      "slug" in raw.data &&
      "developer" in raw.data &&
      "location" in raw.data
    ) {
      return raw.data as Project;
    }
  } catch {
    // Malformed JSON: safely ignore and fall back to API
  }

  return null;
}

export function useProject(
  developerSlug: string | undefined,
  locationSlug: string | undefined,
  projectSlug: string | undefined,
) {
  const cacheKey =
    developerSlug && locationSlug && projectSlug
      ? `${developerSlug}/${locationSlug}/${projectSlug}`
      : null;

  // Hydrate cache synchronously from initial data bootstrap on first load if matching
  if (cacheKey && !projectCache.has(cacheKey)) {
    const initialData = getInitialProjectData(cacheKey);
    if (initialData) {
      projectCache.set(cacheKey, initialData);
    }
  }

  const [project, setProject] = useState<Project | null>(() =>
    cacheKey ? projectCache.get(cacheKey) ?? null : null,
  );
  const [isLoading, setIsLoading] = useState(() =>
    cacheKey ? !projectCache.has(cacheKey) : false,
  );
  const [loadError, setLoadError] = useState<"not-found" | "error" | null>(
    null,
  );

  useEffect(() => {
    if (!developerSlug || !locationSlug || !projectSlug || !cacheKey) {
      setIsLoading(false);
      setLoadError("error");
      return;
    }

    if (projectCache.has(cacheKey)) {
      setProject(projectCache.get(cacheKey)!);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);
    setProject(null);

    getProject(
      developerSlug,
      locationSlug,
      projectSlug,
      controller.signal,
    )
      .then((data) => {
        projectCache.set(cacheKey, data);
        setProject(data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (error instanceof ProjectApiError && error.status === 404) {
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
  }, [developerSlug, locationSlug, projectSlug, cacheKey]);

  return { project, isLoading, loadError };
}
