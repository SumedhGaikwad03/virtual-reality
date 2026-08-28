/*
 * PURPOSE:
 * Public developer API client.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Performs GET /api/developers/:developerSlug HTTP requests, validates response shapes,
 * and provides typed errors.
 */

import { API_BASE_URL } from "./config";
import type { PublicDeveloper } from "../types/developer";

export class DeveloperApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = "DeveloperApiError";
  }
}

export async function getDeveloper(
  developerSlug: string,
  signal?: AbortSignal,
): Promise<PublicDeveloper> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/developers/${encodeURIComponent(developerSlug)}`,
      { signal },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new DeveloperApiError(
      "Developer request failed",
      null,
    );
  }

  if (!response.ok) {
    throw new DeveloperApiError(
      response.status === 404
        ? "Developer not found"
        : "Developer request failed",
      response.status,
    );
  }

  const body: unknown = await response.json();

  if (!isDeveloperResponse(body)) {
    throw new DeveloperApiError(
      "Invalid developer response",
      response.status,
    );
  }

  return body.data;
}

function isDeveloperResponse(
  value: unknown,
): value is { data: PublicDeveloper } {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof value.data === "object" &&
    value.data !== null
  );
}