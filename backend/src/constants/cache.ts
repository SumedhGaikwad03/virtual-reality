/*
 * PURPOSE:
 * Centralized HTTP Cache-Control policy definitions for public API endpoints,
 * administrative interfaces, search queries, not-found states, and error responses.
 *
 * POLICIES:
 * - CACHE_POLICY_CATALOG: 60s client TTL, 12h edge CDN TTL, 7d stale-while-revalidate.
 *   Used for public catalog entities (site config, developers, projects, search catalog).
 * - CACHE_POLICY_SEARCH: 0s client TTL, 5m edge CDN TTL, 1h stale-while-revalidate.
 *   Used for public natural language property search query results.
 * - CACHE_POLICY_NOT_FOUND: 0s client TTL, 60s edge CDN TTL, must-revalidate.
 *   Used for explicitly handled public 404s (e.g. unpublished or missing project/developer).
 * - CACHE_POLICY_PRIVATE: strictly un-cacheable across all public and shared caches.
 *   Used for authenticated administrative routes, session states, and user submissions.
 * - CACHE_POLICY_ERROR: strictly un-cacheable error response policy.
 *   Used for 4xx bad requests, 401 unauthorized, 403 forbidden, and 500 server errors.
 */

export const CACHE_POLICY_CATALOG =
  "public, max-age=60, s-maxage=43200, stale-while-revalidate=604800";

export const CACHE_POLICY_SEARCH =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=3600";

export const CACHE_POLICY_NOT_FOUND =
  "public, max-age=0, s-maxage=60, must-revalidate";

export const CACHE_POLICY_PRIVATE =
  "private, no-cache, no-store, must-revalidate";

export const CACHE_POLICY_ERROR =
  "no-cache, no-store, must-revalidate";
