/*
 * PURPOSE:
 * Public site API client.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Performs GET /api/site HTTP requests, validates response shapes, and provides typed errors.
 */

import { API_BASE_URL } from "./config";
import type { Site } from "../types/site";

export class SiteApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = "SiteApiError";
  }
}

export async function getSite(signal?: AbortSignal): Promise<Site> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/site`, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new SiteApiError("Site request failed", null);
  }

  if (!response.ok) {
    throw new SiteApiError(
      response.status === 404 ? "Site not found" : "Site request failed",
      response.status,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new SiteApiError("Invalid site response", response.status);
  }

  if (!isSiteResponse(body)) {
    throw new SiteApiError("Invalid site response", response.status);
  }

  return body.data;
}

function isSiteResponse(value: unknown): value is { data: Site } {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof value.data === "object" &&
    value.data !== null
  );
}
