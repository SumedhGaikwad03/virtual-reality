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

export function useProject(
  developerSlug: string | undefined,
  locationSlug: string | undefined,
  projectSlug: string | undefined,
) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<"not-found" | "error" | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    if (!developerSlug || !locationSlug || !projectSlug) {
      setIsLoading(false);
      setLoadError("error");
      return () => controller.abort();
    }

    setIsLoading(true);
    setLoadError(null);
    setProject(null);

    getProject(
      developerSlug,
      locationSlug,
      projectSlug,
      controller.signal,
    )
      .then(setProject)
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
  }, [developerSlug, locationSlug, projectSlug]);

  return { project, isLoading, loadError };
}
