/*
 * PURPOSE:
 * Non-destructive, read-only catalog completeness & database integrity audit tool.
 *
 * RESPONSIBILITY:
 * Inspects the current target database and reports:
 * - Entity counts and publishing breakdown (Developers, Projects, Configurations, Media, Leads, Admins).
 * - Real estate content completeness checks (missing configurations, prices, carpet area, descriptions, hero media).
 * - Referential and contextual invariants (media ownership, orphaned records).
 *
 * SAFETY INVARIANTS:
 * - 100% READ-ONLY: Never creates, updates, deletes, resets, or seeds data.
 * - Safe for development, staging, and production environments.
 * - Sanitizes database connection strings (never prints passwords or secrets).
 */

import "dotenv/config";
import { prisma } from "../lib/prisma.js";

function getMaskedDbHost(urlStr?: string): string {
  if (!urlStr) return "NOT CONFIGURED";
  try {
    const parsed = new URL(urlStr);
    const host = parsed.host;
    const dbName = parsed.pathname.replace(/^\//, "");
    return `${parsed.protocol}//***:***@${host}/${dbName}`;
  } catch {
    return "CONFIGURED (MASKED)";
  }
}

export async function runDatabaseAudit() {
  const dbUrl = process.env.DATABASE_URL;
  console.log("================================================================================");
  console.log("             VIRTUAL REALITY PLATFORM: DATABASE CATALOG AUDIT (READ-ONLY)       ");
  console.log("================================================================================");
  console.log(`Target Database: ${getMaskedDbHost(dbUrl)}`);
  console.log(`Environment:     ${process.env.NODE_ENV || "development"}`);
  console.log(`Audit Time:      ${new Date().toISOString()}\n`);

  // 1. Fetch Entity Records concurrently (Read-Only)
  const [
    admins,
    developers,
    projects,
    configurations,
    media,
    highlights,
    amenities,
    leads,
    pushSubscriptions,
    firmContact,
    firmProfile,
  ] = await Promise.all([
    prisma.admin.findMany(),
    prisma.developer.findMany({
      include: { projects: true, media: true },
    }),
    prisma.project.findMany({
      include: {
        developer: true,
        configurations: true,
        highlights: true,
        amenities: true,
        media: true,
      },
    }),
    prisma.configuration.findMany({
      include: { project: true, media: true },
    }),
    prisma.media.findMany(),
    prisma.projectHighlight.findMany(),
    prisma.projectAmenity.findMany(),
    prisma.lead.findMany(),
    prisma.pushSubscription.findMany(),
    prisma.firmContact.findUnique({ where: { id: "default" } }),
    prisma.firmProfile.findUnique({ where: { id: "default" } }),
  ]);

  // 2. Entity Summary Counts
  console.log("--------------------------------------------------------------------------------");
  console.log("1. ENTITY SUMMARY COUNTS");
  console.log("--------------------------------------------------------------------------------");
  const publishedDevs = developers.filter((d) => d.publishStatus === "PUBLISHED");
  const publishedProjects = projects.filter((p) => p.publishStatus === "PUBLISHED");
  const activeMedia = media.filter((m) => m.isActive);

  console.log(`  - Admins:              ${admins.length} (Founders: ${admins.filter((a) => a.role === "FOUNDER").length}, Employees: ${admins.filter((a) => a.role === "EMPLOYEE").length}, Active: ${admins.filter((a) => a.isActive).length})`);
  console.log(`  - Developers:          ${developers.length} (Published: ${publishedDevs.length}, Draft: ${developers.length - publishedDevs.length})`);
  console.log(`  - Projects:            ${projects.length} (Published: ${publishedProjects.length}, Featured: ${projects.filter((p) => p.featured).length})`);
  console.log(`  - Configurations:      ${configurations.length}`);
  console.log(`  - Project Highlights:  ${highlights.length}`);
  console.log(`  - Project Amenities:   ${amenities.length}`);
  console.log(`  - Media Assets:        ${media.length} (Active: ${activeMedia.length})`);
  console.log(`  - Leads Captured:      ${leads.length} (New: ${leads.filter((l) => l.status === "NEW").length}, In-Progress: ${leads.filter((l) => l.status === "IN_PROGRESS").length}, Done: ${leads.filter((l) => l.status === "DONE").length})`);
  console.log(`  - Push Subscriptions:  ${pushSubscriptions.length}`);
  console.log(`  - Firm Contact Record: ${firmContact ? "Customized (persisted in DB)" : "Default (in-memory fallback active)"}`);
  console.log(`  - Firm Profile Record: ${firmProfile ? "Customized (persisted in DB)" : "Default (in-memory fallback active)"}`);

  // 3. Media Breakdown by Context
  console.log("\n--------------------------------------------------------------------------------");
  console.log("2. MEDIA CONTEXT BREAKDOWN");
  console.log("--------------------------------------------------------------------------------");
  const homeMedia = media.filter((m) => m.context === "HOME");
  const devMedia = media.filter((m) => m.context === "DEVELOPER");
  const projMedia = media.filter((m) => m.context === "PROJECT");
  const configMedia = media.filter((m) => m.context === "CONFIGURATION");
  console.log(`  - HOME Media:          ${homeMedia.length} (Hero: ${homeMedia.filter((m) => m.category === "HERO").length}, Carousel: ${homeMedia.filter((m) => m.category === "HERO_CAROUSEL").length}, Cards: ${homeMedia.filter((m) => m.category === "CARD").length}, Gallery: ${homeMedia.filter((m) => m.category === "GALLERY").length})`);
  console.log(`  - DEVELOPER Media:     ${devMedia.length}`);
  console.log(`  - PROJECT Media:       ${projMedia.length} (Hero: ${projMedia.filter((m) => m.category === "HERO").length}, Gallery: ${projMedia.filter((m) => m.category === "GALLERY").length}, Floor Plans: ${projMedia.filter((m) => m.category === "FLOOR_PLAN").length}, Amenities: ${projMedia.filter((m) => m.category === "AMENITY").length})`);
  console.log(`  - CONFIGURATION Media: ${configMedia.length}`);

  // 4. Content Completeness & Publishing Diagnostics
  console.log("\n--------------------------------------------------------------------------------");
  console.log("3. CONTENT COMPLETENESS & PUBLISHING CHECKS");
  console.log("--------------------------------------------------------------------------------");
  const issues: string[] = [];

  // Check published projects
  for (const p of publishedProjects) {
    if (p.configurations.length === 0) {
      issues.push(`Published Project "${p.name}" (${p.slug}) has ZERO configurations.`);
    }
    const hasActiveMedia = p.media.some((m) => m.isActive);
    if (!hasActiveMedia) {
      issues.push(`Published Project "${p.name}" (${p.slug}) has NO active media assets.`);
    }
    const hasHero = p.media.some((m) => m.isActive && (m.category === "HERO" || m.isPrimary));
    if (!hasHero && p.media.length > 0) {
      issues.push(`Published Project "${p.name}" (${p.slug}) is missing an active HERO / Primary image.`);
    }
    if (!p.description || p.description.trim().length === 0) {
      issues.push(`Published Project "${p.name}" (${p.slug}) is missing a description.`);
    }
    if (!p.address || p.address.trim().length === 0 || !p.locationName) {
      issues.push(`Published Project "${p.name}" (${p.slug}) is missing location or address information.`);
    }
  }

  // Check developers
  for (const d of publishedDevs) {
    if (!d.description || d.description.trim().length === 0) {
      issues.push(`Published Developer "${d.name}" (${d.slug}) is missing a description.`);
    }
    if (!d.websiteUrl || d.websiteUrl.trim().length === 0) {
      issues.push(`Published Developer "${d.name}" (${d.slug}) is missing a website URL.`);
    }
  }

  // Check configurations
  for (const c of configurations) {
    if (!c.carpetArea || c.carpetArea <= 0) {
      issues.push(`Configuration "${c.name}" on project ${c.projectId} has invalid carpetArea (${c.carpetArea}).`);
    }
    if (!c.priceFrom || c.priceFrom <= 0n) {
      issues.push(`Configuration "${c.name}" on project ${c.projectId} has invalid priceFrom (${c.priceFrom}).`);
    }
  }

  // Check media ownership integrity
  for (const m of media) {
    if (m.context === "HOME" && (m.developerId || m.projectId || m.configurationId)) {
      issues.push(`Media asset ${m.id} has context HOME but is bound to developer/project/configuration.`);
    }
    if (m.context === "DEVELOPER" && (!m.developerId || m.projectId || m.configurationId)) {
      issues.push(`Media asset ${m.id} has context DEVELOPER with invalid ownership links.`);
    }
    if (m.context === "PROJECT" && (!m.projectId || m.configurationId)) {
      issues.push(`Media asset ${m.id} has context PROJECT with invalid ownership links.`);
    }
    if (m.context === "CONFIGURATION" && !m.configurationId) {
      issues.push(`Media asset ${m.id} has context CONFIGURATION without configurationId.`);
    }
  }

  if (issues.length === 0) {
    console.log("  ✓ All published developers, projects, configurations, and media meet completeness criteria!");
  } else {
    console.log(`  Found ${issues.length} potential content gap(s) or notice(s):`);
    for (const issue of issues) {
      console.log(`  - [NOTICE] ${issue}`);
    }
  }

  console.log("\n================================================================================");
  console.log(`AUDIT COMPLETE: Database read successfully with 0 writes performed.`);
  console.log("================================================================================\n");

  await prisma.$disconnect();
}

// Auto-run if executed directly
runDatabaseAudit().catch((err) => {
  console.error("Database audit error:", err);
  process.exit(1);
});
