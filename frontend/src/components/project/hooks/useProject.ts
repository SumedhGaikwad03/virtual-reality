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

export function useProject(
  developerSlug: string | undefined,
  locationSlug: string | undefined,
  projectSlug: string | undefined,
) {
  const cacheKey =
    developerSlug && locationSlug && projectSlug
      ? `${developerSlug}/${locationSlug}/${projectSlug}`
      : null;

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
