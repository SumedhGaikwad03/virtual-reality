/*
 * PURPOSE:
 * Client-side query builder and adaptive rule engine for button-driven property search.
 *
 * FLOW:
 * Guided Search Lifecycle Flow: SearchCatalog -> query-builder -> useSearchChat.
 *
 * RESPONSIBILITY:
 * 1. Derives all selectable options strictly from currently viable candidate inventory (source of truth).
 * 2. Enforces project-level stopping threshold (PROJECT_STOPPING_THRESHOLD = 3 unique projects).
 * 3. Skips no-op questions (when only 1 option exists or question provides no narrowing separation).
 * 4. Provides warm, human-friendly conversational phrasing for questions.
 * 5. Provides INR price formatting utility (e.g. ₹ 1.50 Cr+, ₹ 95 Lakhs+).
 */

import type { AvailabilityStatus } from "../types/admin-configuration";
import type { SearchCatalogProject, SearchCatalogConfiguration } from "../types/search-catalog";

export const PROJECT_STOPPING_THRESHOLD = 3;

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

/**
 * Formats a paise price string or bigint into clean Indian real-estate denominations.
 */
export function formatPrice(priceFrom: string | bigint): string {
  try {
    const paise = typeof priceFrom === "bigint" ? priceFrom : BigInt(priceFrom || "0");
    const rupees = Number(paise / 100n);
    if (rupees <= 0) return "Price on Request";

    if (rupees >= 10000000) {
      const cr = rupees / 10000000;
      return `₹ ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr+`;
    }
    if (rupees >= 100000) {
      const lakh = rupees / 100000;
      return `₹ ${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} Lakhs+`;
    }
    return `₹ ${rupees.toLocaleString("en-IN")}+`;
  } catch {
    return "Price on Request";
  }
}

/**
 * Filters the public search catalog by all active query constraints.
 */
export function filterCatalog(
  catalog: SearchCatalogProject[],
  query: PropertySearchQuery,
): Array<{ project: SearchCatalogProject; configuration: SearchCatalogConfiguration }> {
  return catalog.flatMap((project) => {
    if (query.locationSlug && project.location.slug !== query.locationSlug) {
      return [];
    }

    if (query.developerSlug && project.developer.slug !== query.developerSlug) {
      return [];
    }

    if (query.projectSlug && project.slug !== query.projectSlug) {
      return [];
    }

    if (query.projectStatus && project.status !== query.projectStatus) {
      return [];
    }

    const configurations = project.configurations.filter((configuration) => {
      if (query.bhk !== undefined && configuration.bhk !== query.bhk) {
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
        BigInt(configuration.priceFrom) > BigInt(query.maxPrice)
      ) {
        return false;
      }

      if (
        query.availabilityStatus &&
        configuration.availabilityStatus !== query.availabilityStatus
      ) {
        return false;
      }

      return true;
    });

    return configurations.map((configuration) => ({
      project,
      configuration,
    }));
  });
}

/**
 * Extracts unique projects from a list of project-configuration matches.
 */
export function getUniqueProjects(
  matches: ReturnType<typeof filterCatalog>,
): SearchCatalogProject[] {
  const seen = new Set<string>();
  const projects: SearchCatalogProject[] = [];

  for (const match of matches) {
    if (!seen.has(match.project.id)) {
      seen.add(match.project.id);
      projects.push(match.project);
    }
  }

  return projects;
}

// 1. Bedroom count rule (BHK)
const bhkRule: QueryRule = {
  id: "bhk",
  question: "What kind of home are you looking for?",

  getOptions: (catalog, query) => {
    if (query.bhk !== undefined) return [];

    // Derive options strictly from current candidate matches
    const matches = filterCatalog(catalog, query);
    const bhkSet = new Set<number>();

    for (const match of matches) {
      bhkSet.add(match.configuration.bhk);
    }

    const sortedBhks = [...bhkSet].sort((a, b) => a - b);

    // If only 1 BHK option exists across all candidate matches, it provides no narrowing
    if (sortedBhks.length <= 1) {
      return [];
    }

    return sortedBhks.map((bhk) => ({
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
  question: "Where would you like to live?",

  getOptions: (catalog, query) => {
    if (query.locationSlug !== undefined) return [];

    const matches = filterCatalog(catalog, query);
    const locations = new Map<string, string>();

    for (const match of matches) {
      locations.set(match.project.location.slug, match.project.location.name);
    }

    // If only 1 location exists across all matches, asking location provides no narrowing
    if (locations.size <= 1) {
      return [];
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

// 3. Project status rule (Ready to Move vs Under Construction)
const projectStatusRule: QueryRule = {
  id: "project-status",
  question: "Would you prefer a ready-to-move property or under construction?",

  getOptions: (catalog, query) => {
    if (query.projectStatus !== undefined) return [];

    const matches = filterCatalog(catalog, query);
    const statuses = new Set<string>();

    for (const match of matches) {
      statuses.add(match.project.status);
    }

    if (statuses.size <= 1) {
      return [];
    }

    const formatStatusLabel = (status: string) => {
      switch (status) {
        case "READY_TO_MOVE":
          return "Ready to Move";
        case "ONGOING":
          return "Under Construction";
        case "UPCOMING":
          return "New Launch";
        case "COMPLETED":
          return "Completed";
        default:
          return status.replaceAll("_", " ");
      }
    };

    return [...statuses]
      .sort()
      .map((status) => ({
        label: formatStatusLabel(status),
        value: status,
      }));
  },

  apply: (query, value) => ({
    ...query,
    projectStatus: value,
  }),
};

// 4. Budget / maximum price band rule
const priceRule: QueryRule = {
  id: "price",
  question: "What budget feels right for you?",

  getOptions: (catalog, query) => {
    if (query.maxPrice !== undefined) return [];

    const matches = filterCatalog(catalog, query);
    if (matches.length === 0) return [];

    // Real estate budget bands in paise
    const standardBands = [
      { label: "Under ₹1 Cr", value: "1000000000" }, // 10^9 paise
      { label: "Under ₹1.5 Cr", value: "1500000000" },
      { label: "Under ₹2 Cr", value: "2000000000" },
      { label: "Under ₹3 Cr", value: "3000000000" },
      { label: "Under ₹5 Cr", value: "5000000000" },
      { label: "₹5 Cr+", value: "999999999999999999" },
    ];

    // Filter to bands where at least one candidate configuration fits
    const viableBands = standardBands.filter((band) => {
      const limit = BigInt(band.value);
      return matches.some((m) => BigInt(m.configuration.priceFrom) <= limit);
    });

    // Check if the viable bands provide meaningful differentiation
    const matchCounts = new Set(
      viableBands.map((band) => {
        const limit = BigInt(band.value);
        return matches.filter((m) => BigInt(m.configuration.priceFrom) <= limit).length;
      }),
    );

    // If all viable bands include exactly the same number of matches, asking budget is a no-op
    if (matchCounts.size <= 1) {
      return [];
    }

    return viableBands;
  },

  apply: (query, value) => ({
    ...query,
    maxPrice: value,
  }),
};

// 5. Developer preference rule (with "Any developer" option when >= 2 developers exist)
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

    const matches = filterCatalog(catalog, query);
    const developers = new Map<string, string>();

    for (const match of matches) {
      developers.set(match.project.developer.slug, match.project.developer.name);
    }

    // If only 1 developer exists among all matches, asking developer is a no-op
    if (developers.size <= 1) {
      return [];
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

// 6. Unit availability status rule
const availabilityRule: QueryRule = {
  id: "availability",
  question: "What availability status are you looking for?",

  getOptions: (catalog, query) => {
    if (query.availabilityStatus !== undefined) return [];

    const matches = filterCatalog(catalog, query);
    const statuses = new Set<AvailabilityStatus>();

    for (const match of matches) {
      statuses.add(match.configuration.availabilityStatus);
    }

    if (statuses.size <= 1) {
      return [];
    }

    const formatAvailabilityLabel = (status: AvailabilityStatus) => {
      switch (status) {
        case "AVAILABLE":
          return "Available";
        case "LIMITED":
          return "Limited Units";
        case "SOLD_OUT":
          return "Sold Out";
        default:
          return status;
      }
    };

    return [...statuses]
      .sort()
      .map((status) => ({
        label: formatAvailabilityLabel(status),
        value: status,
      }));
  },

  apply: (query, value) => ({
    ...query,
    availabilityStatus: value as AvailabilityStatus,
  }),
};

// Progression sequence prioritized by standard property discovery intent
export const queryRules: QueryRule[] = [
  bhkRule,
  locationRule,
  projectStatusRule,
  priceRule,
  developerRule,
  availabilityRule,
];

/**
 * Evaluates unresolved rules and returns the first rule that meaningfully narrows the inventory.
 * If remaining inventory is <= PROJECT_STOPPING_THRESHOLD or no rule provides narrowing, returns null.
 */
export function getNextQueryRule(
  catalog: SearchCatalogProject[],
  query: PropertySearchQuery,
): QueryRule | null {
  const matches = filterCatalog(catalog, query);

  // Stop if zero matches
  if (matches.length === 0) {
    return null;
  }

  // Stop if unique projects count has reached or is below stopping threshold after at least 1 selection
  const uniqueProjects = getUniqueProjects(matches);
  if (
    Object.keys(query).length > 0 &&
    uniqueProjects.length <= PROJECT_STOPPING_THRESHOLD
  ) {
    return null;
  }

  // Find the first rule in preference sequence that has >= 2 viable options
  for (const rule of queryRules) {
    const options = rule.getOptions(catalog, query);
    if (options.length >= 2) {
      return rule;
    }
  }

  return null;
}

export type QueryBuilderState = {
  query: PropertySearchQuery;
  matches: ReturnType<typeof filterCatalog>;
  uniqueProjects: SearchCatalogProject[];
  nextRule: QueryRule | null;
  isReady: boolean;
};

export function getQueryBuilderState(
  catalog: SearchCatalogProject[],
  query: PropertySearchQuery,
): QueryBuilderState {
  const matches = filterCatalog(catalog, query);
  const uniqueProjects = getUniqueProjects(matches);
  const isReady = shouldShowResults(catalog, query);

  const nextRule =
    matches.length === 0 || isReady
      ? null
      : getNextQueryRule(catalog, query);

  return {
    query,
    matches,
    uniqueProjects,
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

/**
 * Determines whether the assistant should stop questioning and show results:
 * 1. Zero matches -> false (shows empty state recovery)
 * 2. Unfiltered initial state -> false (must ask initial question)
 * 3. Unique projects <= PROJECT_STOPPING_THRESHOLD -> true
 * 4. All meaningful questions answered / no further narrowing possible -> true
 */
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

  const uniqueProjects = getUniqueProjects(matches);
  if (uniqueProjects.length <= PROJECT_STOPPING_THRESHOLD) {
    return true;
  }

  return getNextQueryRule(catalog, query) === null;
}