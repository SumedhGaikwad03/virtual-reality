/*
 * PURPOSE:
 * Client-side search catalog caching service.
 *
 * FLOW:
 * Guided Search Data Flow
 *
 * RESPONSIBILITY:
 * Provides in-memory caching and in-flight request deduplication for the search catalog,
 * ensuring multiple components or search interactions share the same catalog data.
 */

import { getSearchCatalog } from "../api/search-catalog";
import type {
  SearchCatalogProject,
} from "../types/search-catalog";

let catalog: SearchCatalogProject[] | null = null;
let catalogPromise: Promise<SearchCatalogProject[]> | null = null;

export function getCachedSearchCatalog() {
  return catalog;
}

// Caches the in-flight Promise so concurrent callers share a single HTTP request
export async function loadSearchCatalog(): Promise<SearchCatalogProject[]> {
  if (catalog) return catalog;

  if (catalogPromise) return catalogPromise;

  catalogPromise = getSearchCatalog()
    .then((response) => {
      catalog = response.data;
      return catalog;
    })
    .finally(() => {
      catalogPromise = null;
    });

  return catalogPromise;
}

export function clearSearchCatalogCache() {
  catalog = null;
}
