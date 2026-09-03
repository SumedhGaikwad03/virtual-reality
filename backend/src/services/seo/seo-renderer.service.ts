/*
 * PURPOSE:
 * Server-Side SEO & Metadata HTML rendering service.
 *
 * FLOW:
 * Public SEO Route -> seo.routes.ts -> seo-renderer.service.ts -> Prisma -> HTML / XML / TXT Response.
 *
 * RESPONSIBILITY:
 * Generates crawler-optimized HTML documents, dynamic <head> metadata, Open Graph tags,
 * Twitter card headers, Schema.org JSON-LD structured data, pre-rendered semantic body HTML,
 * dynamic XML sitemaps, and robots.txt configuration.
 *
 * INVARIANTS:
 * - Never exposes unpublished/draft project or developer data.
 * - Escapes all dynamic text to prevent XSS.
 * - Safely serializes JSON-LD script blocks.
 * - Does not modify or replace client-side React SPA hydration architecture (uses createRoot).
 */

import { prisma } from "../../lib/prisma.js";
import { projectRepository } from "../../repositories/project.repository.js";
import { developerRepository } from "../../repositories/developer.repository.js";
import { getSite } from "../site.service.js";

const CANONICAL_ORIGIN = "https://www.virtual2reality.in";
const DEFAULT_SITE_NAME = "Virtual Reality";
const DEFAULT_DESCRIPTION =
  "Virtual Reality is a premier architectural real-estate platform showcasing curated residential landmarks and luxury developments in Pune and Mumbai.";
const DEFAULT_OG_IMAGE = `${CANONICAL_ORIGIN}/icons/app-icon.svg`;

// Production compiled bundle filenames from Vite build
const DEFAULT_BUNDLE_SCRIPT = "/assets/index-CeJ6m_xO.js";
const DEFAULT_BUNDLE_STYLE = "/assets/index-DResmAw8.css";

/**
 * Escapes characters that have special meaning in HTML text and attribute nodes.
 */
export function escapeHtml(value: string | null | undefined): string {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Safely serializes JSON-LD objects, escaping HTML script break sequences.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Formats pricing from paise (BigInt or string) into human-readable INR format.
 */
export function formatPriceFromPaise(
  priceInPaise: bigint | string | number | null | undefined,
): string {
  if (priceInPaise == null) return "";
  const paise = typeof priceInPaise === "bigint" ? Number(priceInPaise) : Number(priceInPaise);
  if (isNaN(paise) || paise <= 0) return "";

  const rupees = paise / 100;
  if (rupees >= 10000000) {
    const cr = rupees / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (rupees >= 100000) {
    const lakhs = rupees / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2)} Lakhs`;
  }
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/**
 * Resolves production client script and stylesheet asset tags.
 */
function getClientAssetTags(): string {
  const scriptSrc = process.env.VITE_ASSET_SCRIPT || DEFAULT_BUNDLE_SCRIPT;
  const styleHref = process.env.VITE_ASSET_STYLE || DEFAULT_BUNDLE_STYLE;

  return `
    <script type="module" crossorigin src="${escapeHtml(scriptSrc)}"></script>
    <link rel="stylesheet" crossorigin href="${escapeHtml(styleHref)}">
  `.trim();
}

type DocumentOptions = {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string | null;
  ogType?: "website" | "article" | "place";
  jsonLd?: object | object[] | null;
  semanticBodyHtml: string;
  isNoIndex?: boolean;
};

/**
 * Assembles the full HTML shell for a given route.
 */
function renderHtmlDocument(options: DocumentOptions): string {
  const {
    title,
    description,
    canonicalUrl,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    jsonLd,
    semanticBodyHtml,
    isNoIndex = false,
  } = options;

  const robotsMeta = isNoIndex
    ? '<meta name="robots" content="noindex, nofollow" />'
    : '<meta name="robots" content="index, follow" />';

  const jsonLdScript = jsonLd
    ? `<script type="application/ld+json">${serializeJsonLd(jsonLd)}</script>`
    : "";

  const resolvedImage = ogImage || DEFAULT_OG_IMAGE;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${robotsMeta}
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#172f68" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:site_name" content="${escapeHtml(DEFAULT_SITE_NAME)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(resolvedImage)}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(resolvedImage)}" />

    <!-- Favicon & Manifest -->
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/icons/app-icon.svg" type="image/svg+xml" />

    ${jsonLdScript}
    ${getClientAssetTags()}
  </head>
  <body>
    <div id="root">${semanticBodyHtml}</div>
  </body>
</html>`;
}

/**
 * 1. Generates SEO-optimized HTML for a public project page.
 */
export async function generateProjectHtml(
  developerSlug: string,
  locationSlug: string,
  projectSlug: string,
): Promise<string | null> {
  const project = await projectRepository.findPublicProject(
    developerSlug,
    locationSlug,
    projectSlug,
  );

  if (!project) {
    return null;
  }

  const developerName = project.developer.name;
  const projectName = project.name;
  const locationName = project.locationName;
  const canonicalUrl = `${CANONICAL_ORIGIN}/${developerSlug}/${locationSlug}/${projectSlug}`;

  const title = `${projectName} in ${locationName} by ${developerName} | ${DEFAULT_SITE_NAME}`;
  const description =
    project.description?.trim() ||
    `Explore ${projectName} in ${locationName}, developed by ${developerName}. Discover configurations, floor plans, pricing, and premium amenities on Virtual Reality.`;

  // Select primary hero media
  const heroMedia =
    project.media.find((m) => m.category === "HERO") ||
    project.media.find((m) => m.isPrimary) ||
    project.media[0];
  const ogImage = heroMedia?.url || project.developer.logoUrl || DEFAULT_OG_IMAGE;

  // Build Schema.org structured data
  const offers = project.configurations.map((cfg) => ({
    "@type": "Offer",
    name: cfg.name,
    price: (Number(cfg.priceFrom) / 100).toString(),
    priceCurrency: "INR",
    availability:
      cfg.availabilityStatus === "SOLD_OUT"
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    floorSize: {
      "@type": "QuantitativeValue",
      value: cfg.carpetArea,
      unitCode: "FTK",
      unitText: "sq ft",
    },
  }));

  const amenitiesFeatures = project.amenities.map((amenity) => ({
    "@type": "LocationFeatureSpecification",
    name: amenity.name,
    value: true,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ApartmentComplex",
        "@id": `${canonicalUrl}#property`,
        name: projectName,
        description,
        url: canonicalUrl,
        address: {
          "@type": "PostalAddress",
          streetAddress: project.address,
          addressLocality: locationName,
          addressCountry: "IN",
        },
        ...(project.mapsUrl ? { hasMap: project.mapsUrl } : {}),
        image: project.media.map((m) => m.url),
        ...(amenitiesFeatures.length > 0
          ? { amenityFeature: amenitiesFeatures }
          : {}),
        ...(offers.length > 0 ? { offers } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: CANONICAL_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: developerName,
            item: `${CANONICAL_ORIGIN}/${developerSlug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: projectName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  // Pre-rendered semantic HTML body
  const highlightsHtml =
    project.highlights.length > 0
      ? `<section class="project-seo-highlights">
          <h2>Project Highlights</h2>
          <ul>
            ${project.highlights.map((h) => `<li>${escapeHtml(h.text)}</li>`).join("")}
          </ul>
        </section>`
      : "";

  const configurationsHtml =
    project.configurations.length > 0
      ? `<section class="project-seo-configurations">
          <h2>Available Configurations & Pricing</h2>
          <ul>
            ${project.configurations
              .map(
                (c) => `<li>
                  <strong>${escapeHtml(c.name)}</strong> (${c.bhk} BHK, ${c.carpetArea} sq.ft.) -
                  Starting from ${escapeHtml(formatPriceFromPaise(c.priceFrom))}
                  (${escapeHtml(c.availabilityStatus)})
                </li>`,
              )
              .join("")}
          </ul>
        </section>`
      : "";

  const amenitiesHtml =
    project.amenities.length > 0
      ? `<section class="project-seo-amenities">
          <h2>Amenities</h2>
          <ul>
            ${project.amenities.map((a) => `<li>${escapeHtml(a.name)}</li>`).join("")}
          </ul>
        </section>`
      : "";

  const semanticBodyHtml = `
    <main class="project-page-main" style="max-width: 1200px; margin: 0 auto; padding: 24px;">
      <nav aria-label="Breadcrumb" style="font-size: 14px; margin-bottom: 16px;">
        <a href="/">Home</a> &gt;
        <a href="/${escapeHtml(developerSlug)}">${escapeHtml(developerName)}</a> &gt;
        <span>${escapeHtml(projectName)}</span>
      </nav>

      <header style="margin-bottom: 24px;">
        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">${escapeHtml(projectName)}</h1>
        <p style="font-size: 18px; color: #4b5563;">
          ${escapeHtml(locationName)} · Developed by <a href="/${escapeHtml(developerSlug)}">${escapeHtml(developerName)}</a>
        </p>
        <p style="font-size: 14px; color: #6b7280;">Status: ${escapeHtml(project.status)}</p>
      </header>

      <section class="project-seo-overview" style="margin-bottom: 24px;">
        <h2>About ${escapeHtml(projectName)}</h2>
        <p>${escapeHtml(description)}</p>
        <p><strong>Address:</strong> ${escapeHtml(project.address)}</p>
      </section>

      ${highlightsHtml}
      ${configurationsHtml}
      ${amenitiesHtml}
    </main>
  `.trim();

  return renderHtmlDocument({
    title,
    description,
    canonicalUrl,
    ogImage,
    ogType: "place",
    jsonLd,
    semanticBodyHtml,
  });
}

/**
 * 2. Generates SEO-optimized HTML for a public developer page.
 */
export async function generateDeveloperHtml(
  developerSlug: string,
): Promise<string | null> {
  const developer = await developerRepository.findPublicDeveloper(developerSlug);

  if (!developer) {
    return null;
  }

  const developerName = developer.name;
  const canonicalUrl = `${CANONICAL_ORIGIN}/${developerSlug}`;
  const title = `${developerName} - Projects & Real Estate Developments | ${DEFAULT_SITE_NAME}`;
  const description =
    developer.description?.trim() ||
    `Explore luxury residential landmarks and real estate developments by ${developerName} on Virtual Reality.`;

  const heroMedia =
    developer.media.find((m) => m.category === "DEVELOPER_HERO" || m.category === "HERO") ||
    developer.media[0];
  const ogImage = heroMedia?.url || developer.logoUrl || DEFAULT_OG_IMAGE;

  // Build Schema.org structured data
  const makesOffer = developer.projects.map((proj) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "ApartmentComplex",
      name: proj.name,
      url: `${CANONICAL_ORIGIN}/${developerSlug}/${proj.locationSlug}/${proj.slug}`,
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${canonicalUrl}#organization`,
        name: developerName,
        description,
        url: canonicalUrl,
        ...(developer.logoUrl ? { logo: developer.logoUrl } : {}),
        ...(developer.websiteUrl ? { sameAs: [developer.websiteUrl] } : {}),
        ...(makesOffer.length > 0 ? { makesOffer } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: CANONICAL_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: developerName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  // Pre-rendered semantic HTML body
  const projectsHtml =
    developer.projects.length > 0
      ? `<section class="developer-seo-projects">
          <h2>Projects by ${escapeHtml(developerName)}</h2>
          <ul>
            ${developer.projects
              .map(
                (p) => `<li>
                  <a href="/${escapeHtml(developerSlug)}/${escapeHtml(p.locationSlug)}/${escapeHtml(p.slug)}">
                    <strong>${escapeHtml(p.name)}</strong> in ${escapeHtml(p.locationName)} (${escapeHtml(p.status)})
                  </a>
                </li>`,
              )
              .join("")}
          </ul>
        </section>`
      : "<p>No active projects published currently.</p>";

  const semanticBodyHtml = `
    <main class="developer-page-main" style="max-width: 1200px; margin: 0 auto; padding: 24px;">
      <nav aria-label="Breadcrumb" style="font-size: 14px; margin-bottom: 16px;">
        <a href="/">Home</a> &gt;
        <span>${escapeHtml(developerName)}</span>
      </nav>

      <header style="margin-bottom: 24px;">
        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">${escapeHtml(developerName)}</h1>
        <p style="font-size: 18px; color: #4b5563;">${escapeHtml(description)}</p>
      </header>

      ${projectsHtml}
    </main>
  `.trim();

  return renderHtmlDocument({
    title,
    description,
    canonicalUrl,
    ogImage,
    ogType: "website",
    jsonLd,
    semanticBodyHtml,
  });
}

/**
 * 3. Generates SEO-optimized HTML for the homepage.
 */
export async function generateHomeHtml(): Promise<string> {
  const siteData = await getSite();
  const site = siteData.data;

  const canonicalUrl = CANONICAL_ORIGIN;
  const title = `${site.name || DEFAULT_SITE_NAME} — ${site.tagline || "Architectural Real Estate Platform"}`;
  const description = site.description?.trim() || DEFAULT_DESCRIPTION;

  const heroMedia =
    site.homeMedia.find((m) => m.category === "HERO") || site.homeMedia[0];
  const ogImage = heroMedia?.url || site.logoUrl || DEFAULT_OG_IMAGE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_ORIGIN}/#website`,
        name: site.name || DEFAULT_SITE_NAME,
        url: CANONICAL_ORIGIN,
        description,
        potentialAction: {
          "@type": "SearchAction",
          target: `${CANONICAL_ORIGIN}/search`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${CANONICAL_ORIGIN}/#organization`,
        name: site.name || DEFAULT_SITE_NAME,
        url: CANONICAL_ORIGIN,
        logo: site.logoUrl || DEFAULT_OG_IMAGE,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: site.contact?.phone || undefined,
          email: site.contact?.email || undefined,
          contactType: "customer service",
        },
      },
    ],
  };

  const featuredProjectsHtml =
    site.featuredProjects.length > 0
      ? `<section class="home-seo-featured-projects">
          <h2>Featured Residential Developments</h2>
          <ul>
            ${site.featuredProjects
              .map(
                (p) => `<li>
                  <a href="/${escapeHtml(p.developer.slug)}/${escapeHtml(p.location.slug)}/${escapeHtml(p.slug)}">
                    ${escapeHtml(p.name)} in ${escapeHtml(p.location.name)} by ${escapeHtml(p.developer.name)}
                  </a>
                </li>`,
              )
              .join("")}
          </ul>
        </section>`
      : "";

  const developersHtml =
    site.developers.length > 0
      ? `<section class="home-seo-developers">
          <h2>Featured Developers</h2>
          <ul>
            ${site.developers
              .map(
                (d) => `<li>
                  <a href="/${escapeHtml(d.slug)}">${escapeHtml(d.name)}</a>
                </li>`,
              )
              .join("")}
          </ul>
        </section>`
      : "";

  const semanticBodyHtml = `
    <main class="home-page-container" style="max-width: 1200px; margin: 0 auto; padding: 24px;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 36px; font-weight: bold; margin-bottom: 12px;">${escapeHtml(site.name || DEFAULT_SITE_NAME)}</h1>
        <p style="font-size: 20px; color: #374151;">${escapeHtml(site.tagline || "Architectural Real Estate Platform")}</p>
        <p style="font-size: 16px; color: #6b7280; margin-top: 8px;">${escapeHtml(description)}</p>
      </header>

      ${featuredProjectsHtml}
      ${developersHtml}

      <section style="margin-top: 32px;">
        <p><a href="/search" style="font-weight: 600; color: #1d4ed8;">Explore all properties &amp; search assistant &rarr;</a></p>
      </section>
    </main>
  `.trim();

  return renderHtmlDocument({
    title,
    description,
    canonicalUrl,
    ogImage,
    ogType: "website",
    jsonLd,
    semanticBodyHtml,
  });
}

/**
 * Format project status for readable display.
 */
function formatProjectStatus(status: string): string {
  switch (status) {
    case "READY_TO_MOVE":
      return "Ready to Move";
    case "ONGOING":
      return "Ongoing";
    case "UPCOMING":
      return "Upcoming";
    case "COMPLETED":
      return "Completed";
    case "SOLD_OUT":
      return "Sold Out";
    default:
      return status;
  }
}

/**
 * 4. Generates SEO-optimized HTML for a Location Hub page.
 */
export async function generateLocationHtml(
  locationSlug: string,
): Promise<string | null> {
  const projects = await projectRepository.findLocationProjects(locationSlug);

  if (!projects || projects.length === 0) {
    return null;
  }

  const locationName = projects[0].locationName;
  const canonicalUrl = `${CANONICAL_ORIGIN}/location/${locationSlug}`;
  const projectCount = projects.length;

  // Aggregate unique developers
  const developerMap = new Map<string, { name: string; slug: string; logoUrl?: string | null }>();
  // Aggregate unique BHKs
  const bhkSet = new Set<number>();
  // Aggregate price range
  let minPricePaise: bigint | null = null;
  let maxPricePaise: bigint | null = null;

  for (const proj of projects) {
    if (!developerMap.has(proj.developer.slug)) {
      developerMap.set(proj.developer.slug, {
        name: proj.developer.name,
        slug: proj.developer.slug,
        logoUrl: proj.developer.logoUrl,
      });
    }

    for (const cfg of proj.configurations) {
      if (cfg.bhk) {
        bhkSet.add(cfg.bhk);
      }
      if (cfg.priceFrom && cfg.priceFrom > 0n) {
        if (minPricePaise === null || cfg.priceFrom < minPricePaise) {
          minPricePaise = cfg.priceFrom;
        }
        if (maxPricePaise === null || cfg.priceFrom > maxPricePaise) {
          maxPricePaise = cfg.priceFrom;
        }
      }
    }
  }

  const developers = Array.from(developerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const developerCount = developers.length;
  const sortedBhks = Array.from(bhkSet).sort((a, b) => a - b);
  const bhkSummary = sortedBhks.length > 0 ? `${sortedBhks.join(", ")} BHK` : "";

  const title = `Residential Projects in ${locationName}, Pune | ${DEFAULT_SITE_NAME}`;
  const description = `Explore ${projectCount} residential ${projectCount === 1 ? "project" : "projects"} in ${locationName}, Pune across ${developerCount} ${developerCount === 1 ? "developer" : "developers"}${bhkSummary ? ` offering ${bhkSummary} options` : ""}${minPricePaise ? ` starting from ${formatPriceFromPaise(minPricePaise)}` : ""}. View floor plans, pricing, and project details on Virtual Reality.`;

  // Select hero image from first project
  const firstProj = projects[0];
  const heroMedia =
    firstProj.media.find((m) => m.category === "HERO") ||
    firstProj.media.find((m) => m.isPrimary) ||
    firstProj.media[0];
  const ogImage = heroMedia?.url || firstProj.developer.logoUrl || DEFAULT_OG_IMAGE;

  // Build JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `${canonicalUrl}#place`,
        name: `${locationName}, Pune`,
        description: `Residential neighborhood in Pune featuring luxury real estate developments.`,
        url: canonicalUrl,
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#itemlist`,
        name: `Residential Projects in ${locationName}, Pune`,
        numberOfItems: projectCount,
        itemListElement: projects.map((proj, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: proj.name,
          url: `${CANONICAL_ORIGIN}/${proj.developer.slug}/${proj.locationSlug}/${proj.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: CANONICAL_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects in Pune",
            item: `${CANONICAL_ORIGIN}/projects-in-pune`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: locationName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  // Pre-rendered semantic HTML body
  const projectsListHtml = projects
    .map((p) => {
      const projUrl = `/${escapeHtml(p.developer.slug)}/${escapeHtml(p.locationSlug)}/${escapeHtml(p.slug)}`;
      const devUrl = `/${escapeHtml(p.developer.slug)}`;
      const statusText = formatProjectStatus(p.status);

      const configsHtml =
        p.configurations.length > 0
          ? `<ul style="margin: 8px 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
              ${p.configurations
                .map(
                  (c) => `<li>
                    ${c.bhk} BHK (${c.carpetArea} sq.ft.) - Starting from ${escapeHtml(formatPriceFromPaise(c.priceFrom))}
                  </li>`,
                )
                .join("")}
            </ul>`
          : "";

      const highlightsHtml =
        p.highlights.length > 0
          ? `<p style="font-size: 14px; color: #6b7280; margin-top: 6px;">
              <strong>Highlights:</strong> ${p.highlights.map((h) => escapeHtml(h.text)).join(" · ")}
            </p>`
          : "";

      return `
        <article style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 22px; font-weight: bold; margin-bottom: 6px;">
            <a href="${projUrl}" style="color: #172f68; text-decoration: none;">${escapeHtml(p.name)}</a>
          </h3>
          <p style="font-size: 15px; color: #374151; margin-bottom: 6px;">
            Developed by <a href="${devUrl}" style="color: #1d4ed8; text-decoration: underline;">${escapeHtml(p.developer.name)}</a>
            · <span>Status: ${escapeHtml(statusText)}</span>
          </p>
          <p style="font-size: 14px; color: #4b5563;"><strong>Address:</strong> ${escapeHtml(p.address)}</p>
          ${p.description ? `<p style="font-size: 14px; color: #4b5563; margin-top: 8px;">${escapeHtml(p.description)}</p>` : ""}
          ${configsHtml}
          ${highlightsHtml}
          <div style="margin-top: 12px;">
            <a href="${projUrl}" style="display: inline-block; font-weight: 600; color: #1d4ed8; font-size: 14px;">
              View configurations &amp; floor plans &rarr;
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  const developersListHtml = developers
    .map((d) => `<li><a href="/${escapeHtml(d.slug)}" style="color: #1d4ed8;">${escapeHtml(d.name)}</a></li>`)
    .join("");

  const semanticBodyHtml = `
    <main class="location-page-main" style="max-width: 1200px; margin: 0 auto; padding: 24px;">
      <nav aria-label="Breadcrumb" style="font-size: 14px; margin-bottom: 16px;">
        <a href="/">Home</a> &gt;
        <a href="/projects-in-pune">Projects in Pune</a> &gt;
        <span>${escapeHtml(locationName)}</span>
      </nav>

      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">Residential Projects in ${escapeHtml(locationName)}, Pune</h1>
        <p style="font-size: 18px; color: #4b5563;">
          Explore ${projectCount} residential ${projectCount === 1 ? "development" : "developments"} in ${escapeHtml(locationName)} from ${developerCount} premier ${developerCount === 1 ? "developer" : "developers"}.
          ${minPricePaise ? `Pricing starts from ${escapeHtml(formatPriceFromPaise(minPricePaise))}.` : ""}
        </p>
      </header>

      <section class="location-seo-projects" style="margin-bottom: 36px;">
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Projects in ${escapeHtml(locationName)}</h2>
        ${projectsListHtml}
      </section>

      <section class="location-seo-developers" style="margin-bottom: 36px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">Featured Developers in ${escapeHtml(locationName)}</h2>
        <ul style="padding-left: 20px;">
          ${developersListHtml}
        </ul>
      </section>

      <section style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p><a href="/search" style="font-weight: 600; color: #1d4ed8;">Search all properties in Pune &amp; talk to Tara &rarr;</a></p>
      </section>
    </main>
  `.trim();

  return renderHtmlDocument({
    title,
    description,
    canonicalUrl,
    ogImage,
    ogType: "place",
    jsonLd,
    semanticBodyHtml,
  });
}

/**
 * 5. Generates SEO-optimized HTML for the Pune City Hub page (/projects-in-pune).
 */
export async function generateCityHubHtml(): Promise<string> {
  const projects = await prisma.project.findMany({
    where: {
      publishStatus: "PUBLISHED",
      developer: {
        publishStatus: "PUBLISHED",
      },
    },
    orderBy: [
      { featured: "desc" as const },
      { name: "asc" as const },
      { id: "asc" as const },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      locationName: true,
      locationSlug: true,
      status: true,
      developer: {
        select: {
          name: true,
          slug: true,
        },
      },
      configurations: {
        select: {
          bhk: true,
          priceFrom: true,
        },
      },
    },
  });

  const canonicalUrl = `${CANONICAL_ORIGIN}/projects-in-pune`;
  const projectCount = projects.length;

  // Aggregate localities and developers
  const localityMap = new Map<string, { name: string; slug: string; count: number }>();
  const developerMap = new Map<string, { name: string; slug: string; count: number }>();

  for (const p of projects) {
    if (!localityMap.has(p.locationSlug)) {
      localityMap.set(p.locationSlug, { name: p.locationName, slug: p.locationSlug, count: 0 });
    }
    localityMap.get(p.locationSlug)!.count++;

    if (!developerMap.has(p.developer.slug)) {
      developerMap.set(p.developer.slug, { name: p.developer.name, slug: p.developer.slug, count: 0 });
    }
    developerMap.get(p.developer.slug)!.count++;
  }

  const localities = Array.from(localityMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const developers = Array.from(developerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const localityNames = localities.map((l) => l.name).join(", ");

  const title = `Residential Projects in Pune — Luxury Apartments & Developments | ${DEFAULT_SITE_NAME}`;
  const description = `Explore ${projectCount} premier residential projects across ${localities.length} key localities in Pune (${localityNames}) from ${developers.length} leading developers. Discover floor plans, pricing, and verified property insights on Virtual Reality.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `${canonicalUrl}#city`,
        name: "Pune, Maharashtra, India",
        description: "Premier real estate market with luxury residential developments.",
        url: canonicalUrl,
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#itemlist`,
        name: "Residential Projects in Pune",
        numberOfItems: projectCount,
        itemListElement: projects.map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: p.name,
          url: `${CANONICAL_ORIGIN}/${p.developer.slug}/${p.locationSlug}/${p.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: CANONICAL_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects in Pune",
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  const localitiesListHtml = localities
    .map(
      (l) => `<li style="margin-bottom: 8px;">
        <a href="/location/${escapeHtml(l.slug)}" style="font-size: 16px; color: #1d4ed8; font-weight: 600;">
          ${escapeHtml(l.name)}
        </a>
        <span style="color: #6b7280; font-size: 14px;"> (${l.count} ${l.count === 1 ? "project" : "projects"})</span>
      </li>`,
    )
    .join("");

  const developersListHtml = developers
    .map(
      (d) => `<li style="margin-bottom: 8px;">
        <a href="/${escapeHtml(d.slug)}" style="font-size: 16px; color: #1d4ed8; font-weight: 600;">
          ${escapeHtml(d.name)}
        </a>
        <span style="color: #6b7280; font-size: 14px;"> (${d.count} ${d.count === 1 ? "project" : "projects"})</span>
      </li>`,
    )
    .join("");

  const projectsListHtml = projects
    .map((p) => {
      const projUrl = `/${escapeHtml(p.developer.slug)}/${escapeHtml(p.locationSlug)}/${escapeHtml(p.slug)}`;
      const locUrl = `/location/${escapeHtml(p.locationSlug)}`;
      const devUrl = `/${escapeHtml(p.developer.slug)}`;
      const statusText = formatProjectStatus(p.status);

      return `
        <article style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin-bottom: 16px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">
            <a href="${projUrl}" style="color: #172f68; text-decoration: none;">${escapeHtml(p.name)}</a>
          </h3>
          <p style="font-size: 15px; color: #4b5563;">
            In <a href="${locUrl}" style="color: #1d4ed8;">${escapeHtml(p.locationName)}</a> · Developed by <a href="${devUrl}" style="color: #1d4ed8;">${escapeHtml(p.developer.name)}</a>
            · <span>Status: ${escapeHtml(statusText)}</span>
          </p>
          ${p.description ? `<p style="font-size: 14px; color: #4b5563; margin-top: 6px;">${escapeHtml(p.description)}</p>` : ""}
          <div style="margin-top: 10px;">
            <a href="${projUrl}" style="font-weight: 600; color: #1d4ed8; font-size: 14px;">
              View project details &rarr;
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  const semanticBodyHtml = `
    <main class="city-hub-main" style="max-width: 1200px; margin: 0 auto; padding: 24px;">
      <nav aria-label="Breadcrumb" style="font-size: 14px; margin-bottom: 16px;">
        <a href="/">Home</a> &gt;
        <span>Projects in Pune</span>
      </nav>

      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 36px; font-weight: bold; margin-bottom: 12px;">Residential Projects in Pune</h1>
        <p style="font-size: 18px; color: #374151;">
          Explore ${projectCount} premier residential developments across ${localities.length} key micro-markets in Pune.
        </p>
      </header>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 36px;">
        <section class="city-seo-localities" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: #fafafa;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">Explore by Locality</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${localitiesListHtml}
          </ul>
        </section>

        <section class="city-seo-developers" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: #fafafa;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">Premier Developers in Pune</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${developersListHtml}
          </ul>
        </section>
      </div>

      <section class="city-seo-projects">
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">All Developments in Pune</h2>
        ${projectsListHtml}
      </section>

      <section style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p><a href="/search" style="font-weight: 600; color: #1d4ed8;">Launch property discovery assistant &rarr;</a></p>
      </section>
    </main>
  `.trim();

  return renderHtmlDocument({
    title,
    description,
    canonicalUrl,
    ogType: "website",
    jsonLd,
    semanticBodyHtml,
  });
}

/**
 * 6. Generates a 404 Not Found SEO document for missing or unpublished entities.
 */
export function generate404Html(
  message = "The requested property or developer could not be found or is no longer available.",
): string {
  const title = `Page Not Found | ${DEFAULT_SITE_NAME}`;
  const description = message;
  const canonicalUrl = CANONICAL_ORIGIN;

  const semanticBodyHtml = `
    <main style="max-width: 800px; margin: 60px auto; padding: 24px; text-align: center;">
      <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 16px;">404 - Page Not Found</h1>
      <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">${escapeHtml(message)}</p>
      <a href="/" style="display: inline-block; padding: 10px 20px; background-color: #172f68; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">
        Return to Homepage
      </a>
    </main>
  `.trim();

  return renderHtmlDocument({
    title,
    description,
    canonicalUrl,
    semanticBodyHtml,
    isNoIndex: true,
  });
}

/**
 * 7. Generates dynamic sitemap XML listing all published entities.
 */
export async function generateSitemapXml(): Promise<string> {
  const [projects, developers] = await Promise.all([
    prisma.project.findMany({
      where: {
        publishStatus: "PUBLISHED",
        developer: {
          publishStatus: "PUBLISHED",
        },
      },
      select: {
        slug: true,
        locationSlug: true,
        updatedAt: true,
        developer: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.developer.findMany({
      where: {
        publishStatus: "PUBLISHED",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  const urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq: string;
    priority: string;
  }> = [
    {
      loc: CANONICAL_ORIGIN,
      changefreq: "daily",
      priority: "1.0",
    },
  ];

  // 1. Pune City Hub (if published projects exist)
  if (projects.length > 0) {
    const latestProjectUpdate = projects.reduce((latest, p) => {
      return p.updatedAt > latest ? p.updatedAt : latest;
    }, projects[0].updatedAt);

    urls.push({
      loc: `${CANONICAL_ORIGIN}/projects-in-pune`,
      lastmod: latestProjectUpdate ? latestProjectUpdate.toISOString().split("T")[0] : undefined,
      changefreq: "daily",
      priority: "0.9",
    });
  }

  // 2. Locality Hubs (derived dynamically from published projects)
  const locationMap = new Map<string, Date>();
  for (const proj of projects) {
    const existing = locationMap.get(proj.locationSlug);
    if (!existing || proj.updatedAt > existing) {
      locationMap.set(proj.locationSlug, proj.updatedAt);
    }
  }

  const sortedLocations = Array.from(locationMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  for (const [locationSlug, updatedAt] of sortedLocations) {
    urls.push({
      loc: `${CANONICAL_ORIGIN}/location/${locationSlug}`,
      lastmod: updatedAt ? updatedAt.toISOString().split("T")[0] : undefined,
      changefreq: "daily",
      priority: "0.8",
    });
  }

  // 3. Developer Hubs
  for (const dev of developers) {
    urls.push({
      loc: `${CANONICAL_ORIGIN}/${dev.slug}`,
      lastmod: dev.updatedAt ? dev.updatedAt.toISOString().split("T")[0] : undefined,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  // 4. Project Detail Pages
  for (const proj of projects) {
    urls.push({
      loc: `${CANONICAL_ORIGIN}/${proj.developer.slug}/${proj.locationSlug}/${proj.slug}`,
      lastmod: proj.updatedAt ? proj.updatedAt.toISOString().split("T")[0] : undefined,
      changefreq: "daily",
      priority: "0.9",
    });
  }

  // 5. Search SPA Entrypoint
  urls.push({
    loc: `${CANONICAL_ORIGIN}/search`,
    changefreq: "monthly",
    priority: "0.7",
  });

  const urlElements = urls
    .map((entry) => {
      const lastmodTag = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url>
    <loc>${escapeHtml(entry.loc)}</loc>${lastmodTag}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`.trim();
}

/**
 * 6. Generates standard robots.txt directives.
 */
export function generateRobotsTxt(): string {
  return `# Virtual Reality Search Engine Directives
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/admin/
Disallow: /api/admin/*

Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
`.trim();
}
