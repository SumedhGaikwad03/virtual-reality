/*
 * PURPOSE:
 * Public search catalog API client.
 *
 * FLOW:
 * Guided Search API Flow
 *
 * RESPONSIBILITY:
 * Fetches the complete catalog of published projects, developers, and configurations for client-side guided search.
 */

import { API_BASE_URL } from "./config";
import type { SearchCatalogResponse } from "../types/search-catalog";

export async function getSearchCatalog(): Promise<SearchCatalogResponse> {
  const response = await fetch(`${API_BASE_URL}/search/catalog`);

  if (!response.ok) {
    throw new Error("Unable to load search catalog");
  }

  return response.json();
}