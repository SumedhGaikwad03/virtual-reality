import { useEffect, useState } from "react";
import { loadSearchCatalog } from "../services/search-catalog.service";
import {
  applyQueryRule,
  getQueryBuilderState,
  type PropertySearchQuery,
  type QueryBuilderState,
} from "../services/query-builder";
import type { SearchCatalogProject } from "../types/search-catalog";

export function useSearchQueryBuilder() {
  const [catalog, setCatalog] = useState<SearchCatalogProject[]>([]);
  const [query, setQuery] = useState<PropertySearchQuery>({});
  const [state, setState] = useState<QueryBuilderState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadSearchCatalog()
      .then((loadedCatalog) => {
        if (!active) return;

        setCatalog(loadedCatalog);
        setState(getQueryBuilderState(loadedCatalog, {}));
      })
      .catch(() => {
        if (active) {
          setError("Unable to load property search.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function selectOption(value: string) {
    if (!state?.nextRule) return;

    const nextQuery = applyQueryRule(
      state.nextRule,
      query,
      value,
    );

    setQuery(nextQuery);
    setState(getQueryBuilderState(catalog, nextQuery));
  }

  function reset() {
    setQuery({});
    setState(getQueryBuilderState(catalog, {}));
  }

  return {
  catalog,
  query,
  state,
  isLoading,
  error,
  selectOption,
  reset,
};
}