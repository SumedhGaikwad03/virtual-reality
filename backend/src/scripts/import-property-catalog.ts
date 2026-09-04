/*
 * PURPOSE:
 * Idempotent, Non-Destructive Real-Estate Catalog Ingestion and Synchronization Tool.
 *
 * FLOW:
 * CLI (`--dry-run` or `--write`) -> Catalog File Loader / Validator -> Schema Verification -> Safe Upsert / Diff Report.
 *
 * RESPONSIBILITY:
 * - Ingests verified production real-estate catalog records (Developers, Projects, Highlights, Amenities, Configurations, Media).
 * - Defaults strictly to DRY RUN (0 writes performed).
 * - Matches existing records deterministically by natural unique keys (slugs, project + configuration name, media URL).
 * - Enforces strict completeness and verification gates before permitting live writes (no unverified placeholders).
 * - NEVER deletes or truncates existing records.
 * - NEVER modifies Admin accounts, Leads, PushSubscriptions, or unrelated tables.
 * - Fully masks credentials in all execution logs.
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import type {
  AvailabilityStatus,
  MediaCategory,
  MediaContext,
  MediaType,
  ProjectStatus,
  PublishStatus,
} from "../../generated/prisma/enums.js";

export interface ImportMediaInput {
  context: MediaContext;
  slot?: string | null;
  type: MediaType;
  category: MediaCategory;
  title?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface ImportConfigurationInput {
  name: string;
  bhk: number;
  carpetArea: number;
  builtUpArea?: number | null;
  superBuiltUpArea?: number | null;
  priceFrom: bigint | number | string;
  availabilityStatus: AvailabilityStatus;
  media?: ImportMediaInput[];
}

export interface ImportProjectInput {
  name: string;
  slug: string;
  description: string;
  locationName: string;
  locationSlug: string;
  address: string;
  mapsUrl?: string | null;
  status: ProjectStatus;
  featured?: boolean;
  publishStatus?: PublishStatus;
  highlights?: string[];
  amenities?: string[];
  configurations: ImportConfigurationInput[];
  media?: ImportMediaInput[];
}

export interface ImportDeveloperInput {
  name: string;
  slug: string;
  description: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  publishStatus?: PublishStatus;
  projects: ImportProjectInput[];
  media?: ImportMediaInput[];
}

export interface CatalogImportOptions {
  dryRun: boolean;
  strictProductionChecks?: boolean;
  data: ImportDeveloperInput[];
}

export interface ImportSummaryReport {
  dryRun: boolean;
  developers: { created: number; matched: number; skipped: number };
  projects: { created: number; matched: number; skipped: number };
  highlights: { created: number; matched: number; skipped: number };
  amenities: { created: number; matched: number; skipped: number };
  configurations: { created: number; matched: number; skipped: number };
  media: { created: number; matched: number; skipped: number };
  validationErrors: string[];
  validationWarnings: string[];
}

function isValidHttpUrl(url: unknown): boolean {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isPlaceholderContent(value: string | undefined | null): boolean {
  if (!value) return false;
  const lower = value.toLowerCase();
  return (
    lower.includes("example.com") ||
    lower.includes("placeholder") ||
    lower.includes("lorem ipsum") ||
    lower.includes("official developer name") ||
    lower.includes("official project name")
  );
}

export async function runCatalogImport(
  options: CatalogImportOptions,
): Promise<ImportSummaryReport> {
  const { dryRun, strictProductionChecks = true, data } = options;
  const report: ImportSummaryReport = {
    dryRun,
    developers: { created: 0, matched: 0, skipped: 0 },
    projects: { created: 0, matched: 0, skipped: 0 },
    highlights: { created: 0, matched: 0, skipped: 0 },
    amenities: { created: 0, matched: 0, skipped: 0 },
    configurations: { created: 0, matched: 0, skipped: 0 },
    media: { created: 0, matched: 0, skipped: 0 },
    validationErrors: [],
    validationWarnings: [],
  };

  const rawUrl = process.env.DATABASE_URL || "";
  const maskedUrl = rawUrl.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");

  console.log("================================================================================");
  console.log(`REAL-ESTATE CATALOG INGESTION: ${dryRun ? "DRY RUN (READ-ONLY)" : "LIVE WRITE"}`);
  console.log("================================================================================");
  console.log(`Target Database: ${maskedUrl}`);
  console.log(`Execution Mode:  ${dryRun ? "SIMULATION (0 writes to database)" : "ACTIVE PERSISTENCE"}`);
  console.log(`Input Developers: ${data.length}\n`);

  for (const devInput of data) {
    // 1. Validate Developer
    if (!devInput.name || typeof devInput.name !== "string" || devInput.name.trim() === "") {
      report.validationErrors.push(`Developer missing valid name: ${JSON.stringify(devInput)}`);
      report.developers.skipped++;
      continue;
    }

    if (!devInput.slug || typeof devInput.slug !== "string" || devInput.slug.trim() === "") {
      report.validationErrors.push(`Developer "${devInput.name}" is missing a unique slug.`);
      report.developers.skipped++;
      continue;
    }

    if (devInput.websiteUrl && !isValidHttpUrl(devInput.websiteUrl)) {
      report.validationErrors.push(`Developer "${devInput.name}" has an invalid websiteUrl: ${devInput.websiteUrl}`);
      report.developers.skipped++;
      continue;
    }

    if (strictProductionChecks && !dryRun) {
      if (isPlaceholderContent(devInput.name) || isPlaceholderContent(devInput.description)) {
        report.validationErrors.push(
          `Developer "${devInput.name}" contains placeholder/unverified data. Live write aborted.`,
        );
        report.developers.skipped++;
        continue;
      }
    }

    const existingDev = await prisma.developer.findUnique({
      where: { slug: devInput.slug },
    });

    let developerId: string;

    if (existingDev) {
      report.developers.matched++;
      developerId = existingDev.id;
      console.log(`[DEVELOPER: MATCH] "${devInput.name}" (slug: ${devInput.slug}) -> ID: ${developerId}`);
    } else {
      report.developers.created++;
      console.log(`[DEVELOPER: NEW]   "${devInput.name}" (slug: ${devInput.slug}) will be created.`);
      if (!dryRun) {
        const created = await prisma.developer.create({
          data: {
            name: devInput.name.trim(),
            slug: devInput.slug.trim(),
            description: devInput.description?.trim() ?? null,
            websiteUrl: devInput.websiteUrl?.trim() ?? null,
            logoUrl: devInput.logoUrl?.trim() ?? null,
            publishStatus: devInput.publishStatus ?? "PUBLISHED",
          },
        });
        developerId = created.id;
      } else {
        developerId = `simulated-dev-${devInput.slug}`;
      }
    }

    // Developer Media
    if (devInput.media && Array.isArray(devInput.media)) {
      for (const m of devInput.media) {
        if (!isValidHttpUrl(m.url) || m.context !== "DEVELOPER") {
          report.validationErrors.push(`Invalid developer media for "${devInput.name}": ${m.url}`);
          report.media.skipped++;
          continue;
        }

        const existingMedia = existingDev
          ? await prisma.media.findFirst({
              where: {
                developerId: existingDev.id,
                url: m.url,
                context: "DEVELOPER",
              },
            })
          : null;

        if (existingMedia) {
          report.media.matched++;
        } else {
          report.media.created++;
          if (!dryRun) {
            await prisma.media.create({
              data: {
                developerId,
                context: "DEVELOPER",
                slot: m.slot ?? null,
                type: m.type,
                category: m.category,
                title: m.title ?? null,
                url: m.url,
                thumbnailUrl: m.thumbnailUrl ?? null,
                altText: m.altText ?? null,
                sortOrder: m.sortOrder ?? 0,
                isPrimary: m.isPrimary ?? false,
                isActive: m.isActive ?? true,
                source: "MANUAL",
              },
            });
          }
        }
      }
    }

    // 2. Process Projects
    for (const projInput of devInput.projects || []) {
      if (
        !projInput.name ||
        !projInput.slug ||
        !projInput.locationName ||
        !projInput.locationSlug ||
        !projInput.address
      ) {
        report.validationErrors.push(
          `Project on developer "${devInput.name}" missing required fields (name, slug, location, address): ${projInput.name || "unnamed"}`,
        );
        report.projects.skipped++;
        continue;
      }

      if (projInput.mapsUrl && !isValidHttpUrl(projInput.mapsUrl)) {
        report.validationErrors.push(`Project "${projInput.name}" has an invalid mapsUrl: ${projInput.mapsUrl}`);
        report.projects.skipped++;
        continue;
      }

      if (projInput.publishStatus === "PUBLISHED" && (!projInput.configurations || projInput.configurations.length === 0)) {
        report.validationErrors.push(
          `Project "${projInput.name}" is marked PUBLISHED but has ZERO configurations. A published project must have at least 1 configuration.`,
        );
        report.projects.skipped++;
        continue;
      }

      if (strictProductionChecks && !dryRun) {
        if (isPlaceholderContent(projInput.name) || isPlaceholderContent(projInput.description)) {
          report.validationErrors.push(
            `Project "${projInput.name}" contains placeholder/unverified data. Live write aborted.`,
          );
          report.projects.skipped++;
          continue;
        }
      }

      let existingProj = null;
      if (existingDev) {
        existingProj = await prisma.project.findUnique({
          where: {
            developerId_slug: {
              developerId: existingDev.id,
              slug: projInput.slug,
            },
          },
          include: {
            highlights: true,
            amenities: true,
            configurations: true,
            media: true,
          },
        });
      }

      let projectId: string;

      if (existingProj) {
        report.projects.matched++;
        projectId = existingProj.id;
        console.log(`  [PROJECT: MATCH] "${projInput.name}" (slug: ${projInput.slug}) -> ID: ${projectId}`);
      } else {
        report.projects.created++;
        console.log(`  [PROJECT: NEW]   "${projInput.name}" (slug: ${projInput.slug}) will be created.`);
        if (!dryRun) {
          const createdProj = await prisma.project.create({
            data: {
              developerId,
              name: projInput.name.trim(),
              slug: projInput.slug.trim(),
              description: projInput.description?.trim() ?? null,
              locationName: projInput.locationName.trim(),
              locationSlug: projInput.locationSlug.trim(),
              address: projInput.address.trim(),
              mapsUrl: projInput.mapsUrl?.trim() ?? null,
              status: projInput.status,
              featured: projInput.featured ?? false,
              publishStatus: projInput.publishStatus ?? "PUBLISHED",
            },
          });
          projectId = createdProj.id;
        } else {
          projectId = `simulated-proj-${projInput.slug}`;
        }
      }

      // 3. Process Highlights
      const existingHighlightTexts = new Set(existingProj?.highlights.map((h) => h.text) ?? []);
      const highlights = projInput.highlights || [];
      for (let i = 0; i < highlights.length; i++) {
        const text = highlights[i].trim();
        if (existingHighlightTexts.has(text)) {
          report.highlights.matched++;
        } else {
          report.highlights.created++;
          if (!dryRun) {
            await prisma.projectHighlight.create({
              data: {
                projectId,
                text,
                sortOrder: i,
              },
            });
          }
        }
      }

      // 4. Process Amenities
      const existingAmenityNames = new Set(existingProj?.amenities.map((a) => a.name.toLowerCase()) ?? []);
      const amenities = projInput.amenities || [];
      for (let i = 0; i < amenities.length; i++) {
        const name = amenities[i].trim();
        if (existingAmenityNames.has(name.toLowerCase())) {
          report.amenities.matched++;
        } else {
          report.amenities.created++;
          if (!dryRun) {
            await prisma.projectAmenity.create({
              data: {
                projectId,
                name,
                sortOrder: i,
              },
            });
          }
        }
      }

      // 5. Process Configurations
      const existingConfigMap = new Map(existingProj?.configurations.map((c) => [c.name, c]) ?? []);
      for (const configInput of projInput.configurations || []) {
        const priceBigInt =
          typeof configInput.priceFrom === "bigint"
            ? configInput.priceFrom
            : BigInt(String(configInput.priceFrom));

        if (
          !configInput.name ||
          typeof configInput.bhk !== "number" ||
          configInput.bhk <= 0 ||
          typeof configInput.carpetArea !== "number" ||
          configInput.carpetArea <= 0 ||
          priceBigInt <= 0n
        ) {
          report.validationErrors.push(
            `Configuration on project "${projInput.name}" has invalid fields (BHK, carpetArea, or priceFrom): ${configInput.name || "unnamed"}`,
          );
          report.configurations.skipped++;
          continue;
        }

        let configurationId: string;
        const matchedConfig = existingConfigMap.get(configInput.name);

        if (matchedConfig) {
          report.configurations.matched++;
          configurationId = matchedConfig.id;
        } else {
          report.configurations.created++;
          if (!dryRun) {
            const createdConfig = await prisma.configuration.create({
              data: {
                projectId,
                name: configInput.name.trim(),
                bhk: configInput.bhk,
                carpetArea: configInput.carpetArea,
                builtUpArea: configInput.builtUpArea ?? null,
                superBuiltUpArea: configInput.superBuiltUpArea ?? null,
                priceFrom: priceBigInt,
                availabilityStatus: configInput.availabilityStatus,
              },
            });
            configurationId = createdConfig.id;
          } else {
            configurationId = `simulated-config-${configInput.name}`;
          }
        }

        // Configuration Media
        if (configInput.media && Array.isArray(configInput.media)) {
          for (const cm of configInput.media) {
            if (!isValidHttpUrl(cm.url) || cm.context !== "CONFIGURATION") {
              report.validationErrors.push(
                `Invalid configuration media for "${configInput.name}" on "${projInput.name}": ${cm.url}`,
              );
              report.media.skipped++;
              continue;
            }

            const existingConfigMedia = matchedConfig
              ? await prisma.media.findFirst({
                  where: {
                    configurationId: matchedConfig.id,
                    url: cm.url,
                    context: "CONFIGURATION",
                  },
                })
              : null;

            if (existingConfigMedia) {
              report.media.matched++;
            } else {
              report.media.created++;
              if (!dryRun) {
                await prisma.media.create({
                  data: {
                    configurationId,
                    context: "CONFIGURATION",
                    slot: cm.slot ?? null,
                    type: cm.type,
                    category: cm.category,
                    title: cm.title ?? null,
                    url: cm.url,
                    thumbnailUrl: cm.thumbnailUrl ?? null,
                    altText: cm.altText ?? null,
                    sortOrder: cm.sortOrder ?? 0,
                    isPrimary: cm.isPrimary ?? false,
                    isActive: cm.isActive ?? true,
                    source: "MANUAL",
                  },
                });
              }
            }
          }
        }
      }

      // 6. Project Media
      if (projInput.media && Array.isArray(projInput.media)) {
        for (const pm of projInput.media) {
          if (!isValidHttpUrl(pm.url) || pm.context !== "PROJECT") {
            report.validationErrors.push(`Invalid project media for "${projInput.name}": ${pm.url}`);
            report.media.skipped++;
            continue;
          }

          const existingProjMedia = existingProj
            ? await prisma.media.findFirst({
                where: {
                  projectId: existingProj.id,
                  url: pm.url,
                  context: "PROJECT",
                },
              })
            : null;

          if (existingProjMedia) {
            report.media.matched++;
          } else {
            report.media.created++;
            if (!dryRun) {
              await prisma.media.create({
                data: {
                  projectId,
                  context: "PROJECT",
                  slot: pm.slot ?? null,
                  type: pm.type,
                  category: pm.category,
                  title: pm.title ?? null,
                  url: pm.url,
                  thumbnailUrl: pm.thumbnailUrl ?? null,
                  altText: pm.altText ?? null,
                  sortOrder: pm.sortOrder ?? 0,
                  isPrimary: pm.isPrimary ?? false,
                  isActive: pm.isActive ?? true,
                  source: "MANUAL",
                },
              });
            }
          }
        }
      } else if (projInput.publishStatus === "PUBLISHED" && (!existingProj || existingProj.media.length === 0)) {
        report.validationWarnings.push(
          `[NOTICE] Published project "${projInput.name}" has no media specified. It will render default placeholder cards on public views until images are added.`,
        );
      }
    }
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`IMPORT EXECUTION SUMMARY (${dryRun ? "DRY RUN SIMULATION" : "LIVE WRITES"})`);
  console.log("--------------------------------------------------------------------------------");
  console.log(`  - Developers:     ${report.developers.created} new, ${report.developers.matched} existing, ${report.developers.skipped} skipped`);
  console.log(`  - Projects:       ${report.projects.created} new, ${report.projects.matched} existing, ${report.projects.skipped} skipped`);
  console.log(`  - Highlights:     ${report.highlights.created} new, ${report.highlights.matched} existing, ${report.highlights.skipped} skipped`);
  console.log(`  - Amenities:      ${report.amenities.created} new, ${report.amenities.matched} existing, ${report.amenities.skipped} skipped`);
  console.log(`  - Configurations: ${report.configurations.created} new, ${report.configurations.matched} existing, ${report.configurations.skipped} skipped`);
  console.log(`  - Media Assets:   ${report.media.created} new, ${report.media.matched} existing, ${report.media.skipped} skipped`);

  if (report.validationErrors.length > 0) {
    console.log("\nValidation Errors:");
    for (const err of report.validationErrors) {
      console.log(`  - [ERROR] ${err}`);
    }
  }

  if (report.validationWarnings.length > 0) {
    console.log("\nValidation Notices / Warnings:");
    for (const warn of report.validationWarnings) {
      console.log(`  - ${warn}`);
    }
  }

  console.log("================================================================================\n");

  return report;
}

// Load JSON file from CLI or path
function loadCatalogData(): ImportDeveloperInput[] {
  const fileArgIndex = process.argv.indexOf("--file");
  let filePath =
    fileArgIndex !== -1 && process.argv[fileArgIndex + 1]
      ? process.argv[fileArgIndex + 1]
      : process.env.CATALOG_DATA_FILE;

  if (!filePath) {
    const defaultCatalogPath = path.resolve(process.cwd(), "data/production-property-catalog.json");
    if (fs.existsSync(defaultCatalogPath)) {
      filePath = defaultCatalogPath;
    }
  }

  if (filePath && fs.existsSync(filePath)) {
    console.log(`[DATA SOURCE] Loading catalog dataset from: ${filePath}`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.developers || [];
  }

  // Fallback to sample dry-run structure if no file is provided
  console.log("[DATA SOURCE] No custom data file specified. Using built-in sample template for dry-run simulation.");
  return [
    {
      name: "Sample Developer",
      slug: "sample-developer",
      description: "Leading real estate developer with architectural landmarks across Pune.",
      websiteUrl: "https://www.example.com",
      publishStatus: "PUBLISHED",
      projects: [
        {
          name: "Sample Project Landmark",
          slug: "sample-project-landmark",
          description: "Prime residential development featuring panoramic views and sustainable design.",
          locationName: "Baner",
          locationSlug: "baner",
          address: "Baner Main Road, Pune, Maharashtra 411045",
          mapsUrl: "https://maps.google.com/?q=Baner+Pune",
          status: "ONGOING",
          featured: true,
          publishStatus: "PUBLISHED",
          highlights: [
            "Biometric smart home automation",
            "Clubhouse and temperature-controlled pool",
          ],
          amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "EV Charging Station"],
          configurations: [
            {
              name: "2 BHK",
              bhk: 2,
              carpetArea: 750,
              builtUpArea: 975,
              superBuiltUpArea: 1125,
              priceFrom: 7200000n,
              availabilityStatus: "AVAILABLE",
            },
            {
              name: "3 BHK",
              bhk: 3,
              carpetArea: 1100,
              builtUpArea: 1430,
              superBuiltUpArea: 1650,
              priceFrom: 11500000n,
              availabilityStatus: "AVAILABLE",
            },
          ],
        },
      ],
    },
  ];
}

// Direct CLI Execution
if (
  process.argv[1]?.endsWith("import-property-catalog.ts") ||
  process.argv[1]?.endsWith("import-property-catalog.js")
) {
  const isWriteMode = process.argv.includes("--write");
  const isDryRun = !isWriteMode || process.argv.includes("--dry-run");

  const catalogData = loadCatalogData();

  runCatalogImport({
    dryRun: isDryRun,
    data: catalogData,
  })
    .catch((err) => {
      console.error("Import execution error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
