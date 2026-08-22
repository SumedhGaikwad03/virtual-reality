import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { ImportConfigurationPreview, ImportDraft, ImportMediaPreview } from "./types.js";
import { normalizePriceToPaise } from "./price-normalizer.js";

const MAX_RESPONSE_BYTES = 2_000_000;
const REQUEST_TIMEOUT_MS = 10_000;

export class ImportScraperError extends Error {
  code = "IMPORT_ANALYZE_FAILED";
  statusCode = 502;

  constructor(message = "Unable to analyze this page") {
    super(message);
    this.name = "ImportScraperError";
  }
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  return parts[0] === 10 || parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) || parts[0] === 0;
}

function isPrivateAddress(address: string) {
  if (isIP(address) === 4) return isPrivateIpv4(address);
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") ||
    normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

async function assertSafeUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ImportScraperError("Invalid URL");
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
    throw new ImportScraperError("Invalid URL");
  }
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".local") || isPrivateAddress(hostname)) {
    throw new ImportScraperError("Unsafe URL");
  }
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new ImportScraperError();
  }
  if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new ImportScraperError("Unsafe URL");
  }
  return url;
}

async function readLimitedText(response: Response) {
  if (!response.body) throw new ImportScraperError();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > MAX_RESPONSE_BYTES) throw new ImportScraperError("Page is too large");
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function firstMatch(html: string, expression: RegExp) {
  return decodeHtml(html.match(expression)?.[1]?.trim() ?? "") || null;
}

function slugify(value: string | null) {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || null;
}

function jsonLdObjects(html: string) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => {
    try {
      const parsed: unknown = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }).filter((value): value is Record<string, unknown> => typeof value === "object" && value !== null);
}

function extractMedia(html: string, pageUrl: URL): ImportMediaPreview[] {
  const media: ImportMediaPreview[] = [];
  for (const match of html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi)) {
    try { media.push({ url: new URL(decodeHtml(match[1]), pageUrl).toString(), type: "IMAGE", category: "GALLERY" }); } catch { /* ignore malformed candidates */ }
  }
  for (const match of html.matchAll(/<a[^>]+href=["']([^"']+\.(?:pdf|docx?|xlsx?)(?:\?[^"']*)?)["']/gi)) {
    try { media.push({ url: new URL(decodeHtml(match[1]), pageUrl).toString(), type: "DOCUMENT", category: "BROCHURE" }); } catch { /* ignore malformed candidates */ }
  }
  return media.filter((item, index, items) => items.findIndex((candidate) => candidate.url === item.url) === index).slice(0, 100);
}

function extractConfigurations(text: string): ImportConfigurationPreview[] {
  const configurations: ImportConfigurationPreview[] = [];
  for (const match of text.matchAll(/\b([1-6])\s*BHK\b/gi)) {
    const bhk = Number(match[1]);
    const context = text.slice(Math.max(0, (match.index ?? 0) - 120), (match.index ?? 0) + 220);
    const areaMatch = context.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet)/i);
    const priceMatch = context.match(/(?:₹|INR)\s*[\d,]+(?:\.\d+)?\s*(?:crores?|cr|lakhs?|lacs?|lac|l)?/i);
    const priceFromRaw = priceMatch?.[0] ?? null;
    const candidate: ImportConfigurationPreview = {
      name: `${bhk} BHK`, bhk,
      carpetArea: areaMatch ? Number(areaMatch[1].replace(/,/g, "")) : null,
      builtUpArea: null, superBuiltUpArea: null,
      priceFromRaw, priceFrom: normalizePriceToPaise(priceFromRaw),
      availabilityStatus: null,
    };
    if (!configurations.some((item) => item.bhk === candidate.bhk && item.carpetArea === candidate.carpetArea)) configurations.push(candidate);
  }
  return configurations;
}

export async function scrapeDeveloperProjectPage(rawUrl: string): Promise<ImportDraft> {
  const pageUrl = await assertSafeUrl(rawUrl);
  let response: Response;
  try {
    response = await fetch(pageUrl, { redirect: "manual", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { "User-Agent": "VirtualRealityImportPreview/1.0" } });
  } catch {
    throw new ImportScraperError();
  }
  if (!response.ok || response.status >= 300 && response.status < 400) throw new ImportScraperError();
  const html = await readLimitedText(response);
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = firstMatch(html, /<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/i);
  const siteName = firstMatch(html, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']*)["']/i);
  const objects = jsonLdObjects(html);
  const organization = objects.find((value) => value["@type"] === "Organization");
  const product = objects.find((value) => ["Product", "Residence", "ApartmentComplex"].includes(String(value["@type"]))) ?? objects.find((value) => typeof value.name === "string");
  const developerName = typeof organization?.name === "string" ? organization.name : siteName;
  const projectName = typeof product?.name === "string" ? product.name : title;
  const logoUrl = typeof organization?.logo === "string" ? organization.logo : null;
  const text = decodeHtml(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  return {
    sourceUrl: pageUrl.toString(),
    developer: { name: developerName, slug: slugify(developerName), description: null, logoUrl, websiteUrl: developerName ? pageUrl.origin : null },
    project: { name: projectName, slug: slugify(projectName), description, locationName: null, locationSlug: null, address: null, mapsUrl: null, status: null, featured: null },
    configurations: extractConfigurations(text),
    media: extractMedia(html, pageUrl),
  };
}
