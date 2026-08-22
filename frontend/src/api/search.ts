import { API_BASE_URL } from "./config";
import type { SearchResult } from "../types/search";

export class SearchApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = "SearchApiError";
  }
}

export async function searchProperties(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
      { signal },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new SearchApiError("Search request failed", null);
  }

  if (!response.ok) {
    throw new SearchApiError(
      response.status === 400 ? "Invalid search query" : "Search request failed",
      response.status,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new SearchApiError("Invalid search response", response.status);
  }

  if (!isSearchResponse(body)) {
    throw new SearchApiError("Invalid search response", response.status);
  }

  return body.data;
}

function isSearchResponse(value: unknown): value is { data: SearchResult[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray(value.data)
  );
}
