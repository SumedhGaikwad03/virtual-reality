import { getSearchCatalog } from "../api/search-catalog";
import type {
  SearchCatalogProject,
} from "../types/search-catalog";

let catalog: SearchCatalogProject[] | null = null;
let catalogPromise: Promise<SearchCatalogProject[]> | null = null;

export function getCachedSearchCatalog() {
  return catalog;
}

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

