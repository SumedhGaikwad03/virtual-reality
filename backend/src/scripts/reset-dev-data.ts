/*
 * PURPOSE:
 * Development Database Reset Script.
 *
 * FLOW:
 * Command Line -> reset-dev-data.ts -> Prisma Transaction & Cloudinary Cleanup.
 *
 * RESPONSIBILITY:
 * Safely removes all dummy real-estate property data (Developers, Projects, Configurations,
 * Highlights, Amenities, Media records, Leads) from the DEVELOPMENT database in an atomic
 * transaction while strictly preserving existing Admin user accounts and authentication state.
 */

import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../lib/prisma.js";

// Configure Cloudinary if environment variables exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function extractCloudinaryPublicId(url: string): string | null {
  try {
    if (!url.includes("cloudinary.com")) return null;
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const path = parts[1];
    // Remove version prefix if present (e.g. v1700000000/)
    const versionMatch = path.match(/^(?:v\d+\/)?(.+)$/);
    const pathWithoutVersion = versionMatch ? versionMatch[1] : path;
    // Remove extension
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  // Safety check: Ensure target is local development database
  const isDevDb = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") || dbUrl.includes("5434");
  if (!isDevDb) {
    throw new Error(
      `ABORTING: DATABASE_URL (${dbUrl}) does not match local development database (127.0.0.1 / localhost).`,
    );
  }

  console.log("==================================================");
  console.log("DEVELOPMENT DATABASE RESET INITIATED");
  console.log(`Target Database: ${dbUrl}`);
  console.log("==================================================\n");

  // 1. Verify Admin User Preservation
  const admins = await prisma.admin.findMany();
  console.log(`[AUTH PRESERVATION] Found ${admins.length} Admin user(s):`);
  admins.forEach((admin) => {
    console.log(`  - Admin Email: ${admin.email} (ID: ${admin.id}, Active: ${admin.isActive})`);
  });

  if (admins.length === 0) {
    console.warn("WARNING: No Admin user found in database. Running seed script afterwards will create development admin.");
  }

  // 2. Identify Cloudinary Assets for Media Records
  const allMedia = await prisma.media.findMany();
  console.log(`\n[MEDIA ANALYSIS] Found ${allMedia.length} Media record(s) in database.`);

  const cloudinaryPublicIds: string[] = [];
  const orphanedUrls: string[] = [];

  for (const media of allMedia) {
    const publicId = extractCloudinaryPublicId(media.url);
    if (publicId) {
      cloudinaryPublicIds.push(publicId);
    } else {
      orphanedUrls.push(media.url);
    }
  }

  if (cloudinaryPublicIds.length > 0 && process.env.CLOUDINARY_API_KEY) {
    console.log(`\n[CLOUDINARY CLEANUP] Attempting removal of ${cloudinaryPublicIds.length} Cloudinary asset(s)...`);
    for (const publicId of cloudinaryPublicIds) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`  ✓ Deleted Cloudinary asset: ${publicId}`);
      } catch (err) {
        console.warn(`  ! Could not delete Cloudinary asset (${publicId}): ${(err as Error).message}`);
      }
    }
  } else if (cloudinaryPublicIds.length > 0) {
    console.log(`\n[CLOUDINARY CLEANUP] Cloudinary API credentials not configured. Skipping external asset deletion.`);
    console.log(`  Identified public IDs: ${cloudinaryPublicIds.join(", ")}`);
  }

  if (orphanedUrls.length > 0) {
    console.log(`\n[UNRESOLVED ASSETS] ${orphanedUrls.length} Media URL(s) could not be safely deleted on Cloudinary:`);
    orphanedUrls.forEach((url) => console.log(`  - ${url}`));
  }

  // 3. Perform Atomic Database Reset for Property Data
  console.log("\n[DATABASE RESET] Executing atomic transaction to remove dummy property data...");

  const [
    deletedMedia,
    deletedLeads,
    deletedHighlights,
    deletedAmenities,
    deletedConfigs,
    deletedProjects,
    deletedDevelopers,
  ] = await prisma.$transaction([
    prisma.media.deleteMany({}),
    prisma.lead.deleteMany({}),
    prisma.projectHighlight.deleteMany({}),
    prisma.projectAmenity.deleteMany({}),
    prisma.configuration.deleteMany({}),
    prisma.project.deleteMany({}),
    prisma.developer.deleteMany({}),
  ]);

  console.log("\n==================================================");
  console.log("DATABASE RESET SUMMARY (RECORDS DELETED)");
  console.log("==================================================");
  console.table({
    "Media Records": deletedMedia.count,
    "Leads": deletedLeads.count,
    "Project Highlights": deletedHighlights.count,
    "Project Amenities": deletedAmenities.count,
    "Configurations": deletedConfigs.count,
    "Projects": deletedProjects.count,
    "Developers": deletedDevelopers.count,
  });

  // 4. Final Auth & Entity State Verification
  const remainingAdmins = await prisma.admin.count();
  const remainingDevelopers = await prisma.developer.count();
  const remainingProjects = await prisma.project.count();
  const remainingConfigs = await prisma.configuration.count();
  const remainingMedia = await prisma.media.count();

  console.log("\n==================================================");
  console.log("FINAL DATABASE STATE");
  console.log("==================================================");
  console.log(`Admin Users Remaining (PRESERVED): ${remainingAdmins}`);
  console.log(`Developers Remaining:               ${remainingDevelopers}`);
  console.log(`Projects Remaining:                 ${remainingProjects}`);
  console.log(`Configurations Remaining:           ${remainingConfigs}`);
  console.log(`Media Records Remaining:            ${remainingMedia}`);
  console.log("==================================================\n");
  console.log("✓ SUCCESS: Database reset complete. Ready for real data entry via Admin Panel.");
}

main()
  .catch((err) => {
    console.error("CRITICAL ERROR DURING RESET:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
