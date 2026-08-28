/*
 * PURPOSE:
 * Client-side query builder rule engine for guided property search.
 *
 * FLOW:
 * Guided Search Logic Flow
 *
 * RESPONSIBILITY:
 * Encapsulates sequential discovery rules (BHK, Location, Developer, Price, Availability, Project Status),
 * dynamic option extraction from candidate properties, in-memory catalog filtering, and result readiness checks.
 */

import type { AvailabilityStatus } from "../types/admin-configuration";
import type { SearchCatalogProject } from "../types/search-catalog";

export type PropertySearchQuery = {
  developerSlug?: string;
  locationSlug?: string;
  projectSlug?: string;
  bhk?: number;
  minCarpetArea?: number;
  maxCarpetArea?: number;
  maxPrice?: string;
  availabilityStatus?: AvailabilityStatus;
  projectStatus?: string;

  /**
   * Tracks whether the developer preference question
   * has already been answered with "Any developer".
   *
   * This is UI/query-builder state, not a database filter.
   */
  developerPreferenceAnswered?: boolean;
};

export type QueryOption = {
  label: string;
  value: string;
};

export type QueryRule = {
  id: string;
  question: string;
  getOptions: (
    catalog: SearchCatalogProject[],
    query: PropertySearchQuery,
  ) => QueryOption[];
  apply: (
    query: PropertySearchQuery,
    value: string,
  ) => PropertySearchQuery;
};

// 1. Bedroom count rule
const bhkRule: QueryRule = {
  id: "bhk",
  question: "How many bedrooms are you looking for?",

  getOptions: (catalog, query) => {
    if (query.bhk !== undefined) return [];

    const values = new Set<number>();

    for (const project of catalog) {
      for (const configuration of project.configurations) {
        if (
          query.locationSlug &&
          project.location.slug !== query.locationSlug
        ) {
          continue;
        }

        if (
          query.developerSlug &&
          project.developer.slug !== query.developerSlug
        ) {
          continue;
        }

        if (
          query.projectSlug &&
          project.slug !== query.projectSlug
        ) {
          continue;
        }

        if (
          query.availabilityStatus &&
          configuration.availabilityStatus !== query.availabilityStatus
        ) {
          continue;
        }

        if (
          query.projectStatus &&
          project.status !== query.projectStatus
        ) {
          continue;
        }

        values.add(configuration.bhk);
      }
    }

    return [...values]
      .sort((a, b) => a - b)
      .map((bhk) => ({
        label: `${bhk} BHK`,
        value: String(bhk),
      }));
  },

  apply: (query, value) => ({
    ...query,
    bhk: Number(value),
  }),
};

// 2. Location preference rule
const locationRule: QueryRule = {
  id: "location",
  question: "Which location are you interested in?",

  getOptions: (catalog, query) => {
    if (query.locationSlug !== undefined) return [];

    const locations = new Map<string, string>();

    for (const project of catalog) {
      if (
        query.developerSlug &&
        project.developer.slug !== query.developerSlug
      ) {
        continue;
      }

      if (
        query.projectSlug &&
        project.slug !== query.projectSlug
      ) {
        continue;
      }

      if (
        query.bhk !== undefined &&
        !project.configurations.some(
          (configuration) => configuration.bhk === query.bhk,
        )
      ) {
        continue;
      }

      if (
        query.availabilityStatus &&
        !project.configurations.some(
          (configuration) =>
            configuration.availabilityStatus === query.availabilityStatus &&
            (query.bhk === undefined ||
              configuration.bhk === query.bhk),
        )
      ) {
        continue;
      }

      if (
        query.projectStatus &&
        project.status !== query.projectStatus
      ) {
        continue;
      }

      locations.set(
        project.location.slug,
        project.location.name,
      );
    }

    return [...locations.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([slug, name]) => ({
        label: name,
        value: slug,
      }));
  },

  apply: (query, value) => ({
    ...query,
    locationSlug: value,
  }),
};

// 3. Developer preference rule (with "Any developer" bypass option)
const developerRule: QueryRule = {
  id: "developer",
  question: "Do you have a preferred developer?",

  getOptions: (catalog, query) => {
    if (
      query.developerSlug !== undefined ||
      query.developerPreferenceAnswered
    ) {
      return [];
    }

    const developers = new Map<string, string>();

    for (const project of catalog) {
      if (
        query.locationSlug &&
        project.location.slug !== query.locationSlug
      ) {
        continue;
      }

      if (
        query.projectSlug &&
        project.slug !== query.projectSlug
      ) {
        continue;
      }

      if (
        query.bhk !== undefined &&
        !project.configurations.some(
          (configuration) => configuration.bhk === query.bhk,
        )
      ) {
        continue;
      }

      if (
        query.projectStatus &&
        project.status !== query.projectStatus
      ) {
        continue;
      }

      developers.set(
        project.developer.slug,
        project.developer.name,
      );
    }

    return [
      ...[...developers.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([slug, name]) => ({
          label: name,
          value: slug,
        })),
      {
        label: "Any developer",
        value: "__ANY_DEVELOPER__",
      },
    ];
  },

  apply: (query, value) => {
    if (value === "__ANY_DEVELOPER__") {
      return {
        ...query,
        developerPreferenceAnswered: true,
      };
    }

    return {
      ...query,
      developerSlug: value,
      developerPreferenceAnswered: true,
    };
  },
};

// 4. Budget / maximum price band rule
const priceRule: QueryRule = {
  id: "price",
  question: "What's your budget?",

  getOptions: (catalog, query) => {
    if (query.maxPrice !== undefined) return [];

    const prices: bigint[] = [];

    for (const project of catalog) {
      if (
        query.locationSlug &&
        project.location.slug !== query.locationSlug
      ) {
        continue;
      }

      if (
        query.developerSlug &&
        project.developer.slug !== query.developerSlug
      ) {
        continue;
      }

      if (
        query.projectSlug &&
        project.slug !== query.projectSlug
      ) {
        continue;
      }

      if (
        query.projectStatus &&
        project.status !== query.projectStatus
      ) {
        continue;
      }

      for (const configuration of project.configurations) {
        if (
          query.bhk !== undefined &&
          configuration.bhk !== query.bhk
        ) {
          continue;
        }

        if (
          query.availabilityStatus &&
          configuration.availabilityStatus !==
            query.availabilityStatus
        ) {
          continue;
        }

        prices.push(BigInt(configuration.priceFrom));
      }
    }

    if (prices.length === 0) return [];

    const maxPrice = prices.reduce(
      (maximum, price) =>
        price > maximum ? price : maximum,
      0n,
    );

    // Standard real-estate budget bands in paise
    const bands = [
      { label: "Under ₹1 Cr", value: "10000000" },
      { label: "₹1–2 Cr", value: "20000000" },
      { label: "₹2–3 Cr", value: "30000000" },
      { label: "₹3–5 Cr", value: "50000000" },
      {
        label: "₹5 Cr+",
        value: "999999999999999999",
      },
    ];

    return bands.filter((band) => {
      const limit = BigInt(band.value);
      return maxPrice >= limit;
    });
  },

  apply: (query, value) => ({
    ...query,
    maxPrice: value,
  }),
};

// 5. Unit availability status rule
const availabilityRule: QueryRule = {
  id: "availability",
  question: "What availability are you looking for?",

  getOptions: (catalog, query) => {
    if (query.availabilityStatus !== undefined) return [];

    const values = new Set<AvailabilityStatus>();

    for (const project of catalog) {
      if (
        query.locationSlug &&
        project.location.slug !== query.locationSlug
      ) {
        continue;
      }

      if (
        query.developerSlug &&
        project.developer.slug !== query.developerSlug
      ) {
        continue;
      }

      if (
        query.projectSlug &&
        project.slug !== query.projectSlug
      ) {
        continue;
      }

      if (
        query.projectStatus &&
        project.status !== query.projectStatus
      ) {
        continue;
      }

      for (const configuration of project.configurations) {
        if (
          query.bhk !== undefined &&
          configuration.bhk !== query.bhk
        ) {
          continue;
        }

        values.add(configuration.availabilityStatus);
      }
    }

    return [...values]
      .sort()
      .map((status) => ({
        label: status.replace("_", " "),
        value: status,
      }));
  },

  apply: (query, value) => ({
    ...query,
    availabilityStatus: value as AvailabilityStatus,
  }),
};

// 6. Project construction status rule
const projectStatusRule: QueryRule = {
  id: "project-status",
  question: "What project status are you looking for?",

  getOptions: (catalog, query) => {
    if (query.projectStatus !== undefined) return [];

    const values = new Set<string>();

    for (const project of catalog) {
      if (
        query.locationSlug &&
        project.location.slug !== query.locationSlug
      ) {
        continue;
      }

      if (
        query.developerSlug &&
        project.developer.slug !== query.developerSlug
      ) {
        continue;
      }

      if (
        query.projectSlug &&
        project.slug !== query.projectSlug
      ) {
        continue;
      }

      if (
        query.bhk !== undefined &&
        !project.configurations.some(
          (configuration) => configuration.bhk === query.bhk,
        )
      ) {
        continue;
      }

      if (
        query.availabilityStatus &&
        !project.configurations.some(
          (configuration) =>
            configuration.availabilityStatus ===
              query.availabilityStatus &&
            (query.bhk === undefined ||
              configuration.bhk === query.bhk),
        )
      ) {
        continue;
      }

      values.add(project.status);
    }

    return [...values]
      .sort()
      .map((status) => ({
        label: status.replaceAll("_", " "),
        value: status,
      }));
  },

  apply: (query, value) => ({
    ...query,
    projectStatus: value,
  }),
};

// Ordered question progression sequence
export const queryRules: QueryRule[] = [
  bhkRule,
  locationRule,
  developerRule,
  priceRule,
  availabilityRule,
  projectStatusRule,
];

// Returns the first rule in sequence that still has viable options given current query filters
export function getNextQueryRule(
  catalog: SearchCatalogProject[],
  query: PropertySearchQuery,
): QueryRule | null {
  for (const rule of queryRules) {
    const options = rule.getOptions(catalog, query);

    if (options.length > 0) {
      return rule;
    }
  }

  return null;
}

// In-memory catalog filter producing project-configuration match pairs
export function filterCatalog(
  catalog: SearchCatalogProject[],
  query: PropertySearchQuery,
) {
  return catalog.flatMap((project) => {
    if (
      query.locationSlug &&
      project.location.slug !== query.locationSlug
    ) {
      return [];
    }

    if (
      query.developerSlug &&
      project.developer.slug !== query.developerSlug
    ) {
      return [];
    }

    if (
      query.projectSlug &&
      project.slug !== query.projectSlug
    ) {
      return [];
    }

    if (
      query.projectStatus &&
      project.status !== query.projectStatus
    ) {
      return [];
    }

    const configurations = project.configurations.filter(
      (configuration) => {
        if (
          query.bhk !== undefined &&
          configuration.bhk !== query.bhk
        ) {
          return false;
        }

        if (
          query.minCarpetArea !== undefined &&
          configuration.carpetArea < query.minCarpetArea
        ) {
          return false;
        }

        if (
          query.maxCarpetArea !== undefined &&
          configuration.carpetArea > query.maxCarpetArea
        ) {
          return false;
        }

        if (
          query.maxPrice !== undefined &&
          BigInt(configuration.priceFrom) >
            BigInt(query.maxPrice)
        ) {
          return false;
        }

        if (
          query.availabilityStatus &&
          configuration.availabilityStatus !==
            query.availabilityStatus
        ) {
          return false;
        }

        return true;
      },
    );

    return configurations.map((configuration) => ({
      project,
      configuration,
    }));
  });
}

export type QueryBuilderState = {
  query: PropertySearchQuery;
  matches: ReturnType<typeof filterCatalog>;
  nextRule: QueryRule | null;
  isReady: boolean;
};

export function getQueryBuilderState(
  catalog: SearchCatalogProject[],
  query: PropertySearchQuery,
): QueryBuilderState {
  const matches = filterCatalog(catalog, query);
  const isReady = shouldShowResults(catalog, query);

  const nextRule =
    matches.length === 0 || isReady
      ? null
      : getNextQueryRule(catalog, query);

  return {
    query,
    matches,
    nextRule,
    isReady,
  };
}

export function applyQueryRule(
  rule: QueryRule,
  query: PropertySearchQuery,
  value: string,
): PropertySearchQuery {
  return rule.apply(query, value);
}

// Determines whether matches have narrowed sufficiently (<= 3 items or all questions answered) to show results
export function shouldShowResults(
  catalog: SearchCatalogProject[],
  query: PropertySearchQuery,
): boolean {
  const matches = filterCatalog(catalog, query);

  if (matches.length === 0) {
    return false;
  }

  if (Object.keys(query).length === 0) {
    return false;
  }

  if (matches.length <= 3) {
    return true;
  }

  return getNextQueryRule(catalog, query) === null;
}