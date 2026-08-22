import { API_BASE_URL } from "./config";
import type { Project } from "../types/project";

export class ProjectApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = "ProjectApiError";
  }
}

export async function getProject(
  developerSlug: string,
  locationSlug: string,
  projectSlug: string,
  signal?: AbortSignal,
): Promise<Project> {
  const path = [developerSlug, locationSlug, projectSlug]
    .map(encodeURIComponent)
    .join("/");

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/developers/${path}`, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ProjectApiError("Project request failed", null);
  }

  if (!response.ok) {
    throw new ProjectApiError(
      response.status === 404 ? "Project not found" : "Project request failed",
      response.status,
    );
  }

  const body: unknown = await response.json();

  if (!isProjectResponse(body)) {
    throw new ProjectApiError("Invalid project response", response.status);
  }

  return body.data;
}

function isProjectResponse(value: unknown): value is { data: Project } {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof value.data === "object" &&
    value.data !== null
  );
}
