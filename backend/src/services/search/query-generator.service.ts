import type {
  AvailabilityStatus,
  ProjectStatus,
} from "../../../generated/prisma/enums.js";

export type PropertySearchQuery = {
  developerSlug?: string;
  locationSlug?: string;
  projectSlug?: string;
  bhk?: number;
  minCarpetArea?: number;
  maxCarpetArea?: number;
  maxPrice?: bigint;
  availabilityStatus?: AvailabilityStatus;
  projectStatus?: ProjectStatus;
};

const locationAliases: Record<string, string> = {
  pimpri: "pimpri",
  "pimpri pune": "pimpri",
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePrice(value: string, unit: string) {
  const [whole, fraction = ""] = value.split(".");
  const scale = unit === "crore" || unit === "cr" ? 10_000_000n : 100_000n;
  const base = BigInt(whole) * scale;
  const fractionValue = fraction
    ? (BigInt(fraction) * scale) / 10n ** BigInt(fraction.length)
    : 0n;
  return base + fractionValue;
}

function parseLocation(input: string) {
  const match = input.match(
    /\bin\s+([a-z][a-z\s-]*?)(?=\s+(?:under|below|over|above|with|available|limited|sold\s+out)\b|$)/i,
  );
  if (!match) return undefined;
  return locationAliases[match[1].trim().toLowerCase()];
}

function parseDeveloper(input: string) {
  const match = input.match(/^\s*([a-z0-9]+(?:[-\s][a-z0-9]+)*)\s+projects?\s*$/i);
  return match ? toSlug(match[1]) : undefined;
}

function parseProjectCandidate(input: string, query: PropertySearchQuery) {
  if (
    query.bhk !== undefined ||
    query.locationSlug !== undefined ||
    query.developerSlug !== undefined ||
    query.maxPrice !== undefined ||
    query.minCarpetArea !== undefined ||
    query.maxCarpetArea !== undefined ||
    query.availabilityStatus !== undefined ||
    query.projectStatus !== undefined
  ) {
    return undefined;
  }

  const candidate = toSlug(input);
  const words = input.split(/\s+/).filter(Boolean);
  const genericWords = new Set(["best", "project", "projects", "for", "my", "the"]);

  if (
    words.length < 2 ||
    words.length > 4 ||
    words.some((word) => genericWords.has(word))
  ) {
    return undefined;
  }

  return candidate.includes("-") ? candidate : undefined;
}

export function generatePropertySearchQuery(input: string): PropertySearchQuery {
  const normalized = input.trim().toLowerCase();
  const query: PropertySearchQuery = {};

  const bhkMatch = normalized.match(/\b([1-9]\d?)\s*bhk\b/i);
  if (bhkMatch) query.bhk = Number.parseInt(bhkMatch[1], 10);

  const locationSlug = parseLocation(normalized);
  if (locationSlug) query.locationSlug = locationSlug;

  const developerSlug = parseDeveloper(normalized);
  if (developerSlug) query.developerSlug = developerSlug;

  const priceMatch = normalized.match(
    /\b(?:under|below|up\s+to|upto|max(?:imum)?)\s+(?:₹\s*)?(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac)\b/i,
  );
  if (priceMatch) query.maxPrice = parsePrice(priceMatch[1], priceMatch[2]);

  const minAreaMatch = normalized.match(
    /\b(?:above|over|at\s+least|min(?:imum)?)\s+(\d+)\s*(?:sq\.?\s*ft|sqft)\b/i,
  );
  if (minAreaMatch) query.minCarpetArea = Number.parseInt(minAreaMatch[1], 10);

  const maxAreaMatch = normalized.match(
    /\b(?:under|below|up\s+to|max(?:imum)?)\s+(\d+)\s*(?:sq\.?\s*ft|sqft)\b/i,
  );
  if (maxAreaMatch) query.maxCarpetArea = Number.parseInt(maxAreaMatch[1], 10);

  if (/\bavailable\b/i.test(normalized)) query.availabilityStatus = "AVAILABLE";
  else if (/\blimited\b/i.test(normalized)) query.availabilityStatus = "LIMITED";
  else if (/\bsold\s*out\b/i.test(normalized)) {
    query.availabilityStatus = "SOLD_OUT";
  }

  if (/\bready\s+to\s+move\b/i.test(normalized)) {
    query.projectStatus = "READY_TO_MOVE";
  } else if (/\bupcoming\b/i.test(normalized)) {
    query.projectStatus = "UPCOMING";
  } else if (/\bongoing\b/i.test(normalized)) {
    query.projectStatus = "ONGOING";
  } else if (/\bcompleted\b/i.test(normalized)) {
    query.projectStatus = "COMPLETED";
  }

  const projectSlug = parseProjectCandidate(normalized, query);
  if (projectSlug) query.projectSlug = projectSlug;

  return query;
}
