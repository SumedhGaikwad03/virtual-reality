/*
 * PURPOSE:
 * Dedicated Development Real-Estate Dataset Seeding Script.
 *
 * FLOW:
 * Command Line -> seed-dev-dataset.ts -> Prisma Dataset Seeding.
 *
 * RESPONSIBILITY:
 * Populates the DEVELOPMENT database with a realistic text-only Pune property catalog:
 * - 3 Developers
 * - 6 Projects (2 per Developer)
 * - 30 Configurations (5 per Project with realistic BHK, BHK Plus, carpet area & prices)
 * - Project Highlights and Amenities
 * - ZERO media / image records
 * Strictly preserves existing Admin user accounts and authentication infrastructure.
 */

import "dotenv/config";
import { prisma } from "../lib/prisma.js";

const dataset = [
  {
    name: "Godrej Properties",
    slug: "godrej-properties",
    description: "Leading Indian real estate developer committed to sustainable design, architectural excellence, and modern urban living.",
    websiteUrl: "https://www.godrejproperties.com",
    publishStatus: "PUBLISHED" as const,
    projects: [
      {
        name: "Godrej Elements",
        slug: "godrej-elements",
        description: "A luxurious residential community offering ultra-modern smart homes with advanced biometric access, EV charging bays, and expansive lush green landscapes.",
        locationName: "Hinjewadi",
        locationSlug: "hinjewadi",
        address: "Phase 1, Hinjewadi Rajiv Gandhi Infotech Park, Pune, Maharashtra 411057",
        mapsUrl: "https://maps.google.com/?q=Hinjewadi+Pune",
        status: "ONGOING" as const,
        featured: true,
        publishStatus: "PUBLISHED" as const,
        highlights: [
          "Biometric keyless entry and smart home automation",
          "Over 3 acres of central podium greens and botanical gardens",
          "Exclusive 25,000 sq ft clubhouse with temperature-controlled pool",
          "Strategic location 5 minutes from Hinjewadi IT Hub",
        ],
        amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "Tennis Court", "EV Charging Station", "Jogging Track"],
        configurations: [
          { name: "2 BHK", bhk: 2, carpetArea: 750, builtUpArea: 975, superBuiltUpArea: 1125, priceFrom: 7200000n, availabilityStatus: "AVAILABLE" as const },
          { name: "2 BHK Plus", bhk: 2, carpetArea: 880, builtUpArea: 1144, superBuiltUpArea: 1320, priceFrom: 8500000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK", bhk: 3, carpetArea: 1120, builtUpArea: 1456, superBuiltUpArea: 1680, priceFrom: 11500000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK Plus", bhk: 3, carpetArea: 1320, builtUpArea: 1716, superBuiltUpArea: 1980, priceFrom: 13800000n, availabilityStatus: "LIMITED" as const },
          { name: "4 BHK", bhk: 4, carpetArea: 1650, builtUpArea: 2145, superBuiltUpArea: 2475, priceFrom: 18500000n, availabilityStatus: "LIMITED" as const },
        ],
      },
      {
        name: "Godrej Emerald Waters",
        slug: "godrej-emerald-waters",
        description: "Premium high-rise waterfront residences featuring panoramic scenic views, direct highway connectivity, and resort-inspired leisure amenities.",
        locationName: "Pimpri",
        locationSlug: "pimpri",
        address: "Old Mumbai-Pune Highway, Pimpri-Chinchwad, Pune, Maharashtra 411018",
        mapsUrl: "https://maps.google.com/?q=Pimpri+Pune",
        status: "READY_TO_MOVE" as const,
        featured: false,
        publishStatus: "PUBLISHED" as const,
        highlights: [
          "Ready to move in with OC received",
          "Sky lounge with 360-degree skyline views",
          "Direct access to Mumbai-Pune Highway",
          "Resort-style double height entrance lobby",
        ],
        amenities: ["Sky Lounge", "Infinity Pool", "Squash Court", "Kids Play Area", "Amphitheatre"],
        configurations: [
          { name: "2 BHK", bhk: 2, carpetArea: 710, builtUpArea: 923, superBuiltUpArea: 1065, priceFrom: 6800000n, availabilityStatus: "AVAILABLE" as const },
          { name: "2 BHK Plus", bhk: 2, carpetArea: 820, builtUpArea: 1066, superBuiltUpArea: 1230, priceFrom: 7900000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK", bhk: 3, carpetArea: 1050, builtUpArea: 1365, superBuiltUpArea: 1575, priceFrom: 10500000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK Plus", bhk: 3, carpetArea: 1240, builtUpArea: 1612, superBuiltUpArea: 1860, priceFrom: 12800000n, availabilityStatus: "LIMITED" as const },
          { name: "4 BHK", bhk: 4, carpetArea: 1580, builtUpArea: 2054, superBuiltUpArea: 2370, priceFrom: 17200000n, availabilityStatus: "SOLD_OUT" as const },
        ],
      },
    ],
  },
  {
    name: "Panchshil Realty",
    slug: "panchshil-realty",
    description: "Premier luxury property developer in Pune known for iconic architectural landmarks, international standards, and world-class commercial and residential spaces.",
    websiteUrl: "https://www.panchshil.com",
    publishStatus: "PUBLISHED" as const,
    projects: [
      {
        name: "Panchshil Towers",
        slug: "panchshil-towers",
        description: "An iconic ultra-luxury residential landmark featuring contemporary high-rise towers, 3-level basement parking, and signature concierge services.",
        locationName: "Kharadi",
        locationSlug: "kharadi",
        address: "Near EON Free Zone, Kharadi, Pune, Maharashtra 411014",
        mapsUrl: "https://maps.google.com/?q=Kharadi+Pune",
        status: "COMPLETED" as const,
        featured: true,
        publishStatus: "PUBLISHED" as const,
        highlights: [
          "Pre-cast German technology construction",
          "VRF air conditioning and double-glazed curtain walls",
          "Sprawling 130,000 sq ft amenity zone with private cinema",
          "Walking distance from EON IT Park",
        ],
        amenities: ["Concierge Desk", "Private Cinema", "Heated Pool", "Spa & Sauna", "Squash Court", "Billiards Lounge"],
        configurations: [
          { name: "3 BHK", bhk: 3, carpetArea: 1450, builtUpArea: 1885, superBuiltUpArea: 2175, priceFrom: 22000000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK Plus", bhk: 3, carpetArea: 1750, builtUpArea: 2275, superBuiltUpArea: 2625, priceFrom: 26500000n, availabilityStatus: "AVAILABLE" as const },
          { name: "4 BHK", bhk: 4, carpetArea: 2200, builtUpArea: 2860, superBuiltUpArea: 3300, priceFrom: 34000000n, availabilityStatus: "LIMITED" as const },
          { name: "4 BHK Plus", bhk: 4, carpetArea: 2600, builtUpArea: 3380, superBuiltUpArea: 3900, priceFrom: 41000000n, availabilityStatus: "LIMITED" as const },
          { name: "5 BHK", bhk: 5, carpetArea: 3400, builtUpArea: 4420, superBuiltUpArea: 5100, priceFrom: 56000000n, availabilityStatus: "AVAILABLE" as const },
        ],
      },
      {
        name: "Panchshil One North",
        slug: "panchshil-one-north",
        description: "Exquisite luxury apartments surrounded by 11 acres of private green forest reserves, combining tranquil natural serene living with corporate urban convenience.",
        locationName: "Magarpatta",
        locationSlug: "magarpatta",
        address: "Hadapsar Main Road, near Magarpatta City, Pune, Maharashtra 411028",
        mapsUrl: "https://maps.google.com/?q=Hadapsar+Pune",
        status: "READY_TO_MOVE" as const,
        featured: false,
        publishStatus: "PUBLISHED" as const,
        highlights: [
          "Low-density high-rise living with only 2 suites per floor",
          "Over 70% open green space with forest trails",
          "Multi-tiered security and private elevator lobbies",
        ],
        amenities: ["Private Forest Trail", "Fitness Center", "Lap Pool", "Yoga Deck", "Barbecue Pavilion"],
        configurations: [
          { name: "3 BHK", bhk: 3, carpetArea: 1380, builtUpArea: 1794, superBuiltUpArea: 2070, priceFrom: 19500000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK Plus", bhk: 3, carpetArea: 1620, builtUpArea: 2106, superBuiltUpArea: 2430, priceFrom: 23500000n, availabilityStatus: "AVAILABLE" as const },
          { name: "4 BHK", bhk: 4, carpetArea: 2050, builtUpArea: 2665, superBuiltUpArea: 3075, priceFrom: 31000000n, availabilityStatus: "LIMITED" as const },
          { name: "4 BHK Plus", bhk: 4, carpetArea: 2450, builtUpArea: 3185, superBuiltUpArea: 3675, priceFrom: 37500000n, availabilityStatus: "LIMITED" as const },
          { name: "5 BHK", bhk: 5, carpetArea: 3150, builtUpArea: 4095, superBuiltUpArea: 4725, priceFrom: 51000000n, availabilityStatus: "SOLD_OUT" as const },
        ],
      },
    ],
  },
  {
    name: "VTP Realty",
    slug: "vtp-realty",
    description: "Pune's premier residential developer delivering thoughtfully designed homes with MLA (Maximum Living Area) technology across prime micro-markets.",
    websiteUrl: "https://www.vtprealty.in",
    publishStatus: "PUBLISHED" as const,
    projects: [
      {
        name: "VTP Pegasus",
        slug: "vtp-pegasus",
        description: "A massive 100+ acre mega township featuring MLA-designed efficient homes, 5 star sports academies, and vibrant high-street retail promenades.",
        locationName: "Kharadi",
        locationSlug: "kharadi",
        address: "New Kharadi East, Pune, Maharashtra 412207",
        mapsUrl: "https://maps.google.com/?q=Kharadi+East+Pune",
        status: "ONGOING" as const,
        featured: true,
        publishStatus: "PUBLISHED" as const,
        highlights: [
          "Maximum Living Area (MLA) architectural design with minimal passage waste",
          "Professional cricket ground and Olympic-sized sports infrastructure",
          "Central riverside promenade and retail plaza",
        ],
        amenities: ["Cricket Academy", "Olympic Pool", "Badminton Courts", "Supermarket Promenade", "Skate Park"],
        configurations: [
          { name: "2 BHK", bhk: 2, carpetArea: 690, builtUpArea: 897, superBuiltUpArea: 1035, priceFrom: 6200000n, availabilityStatus: "AVAILABLE" as const },
          { name: "2 BHK Plus", bhk: 2, carpetArea: 810, builtUpArea: 1053, superBuiltUpArea: 1215, priceFrom: 7400000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK", bhk: 3, carpetArea: 1020, builtUpArea: 1326, superBuiltUpArea: 1530, priceFrom: 9800000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK Plus", bhk: 3, carpetArea: 1210, builtUpArea: 1573, superBuiltUpArea: 1815, priceFrom: 11800000n, availabilityStatus: "LIMITED" as const },
          { name: "4 BHK", bhk: 4, carpetArea: 1540, builtUpArea: 2002, superBuiltUpArea: 2310, priceFrom: 15800000n, availabilityStatus: "AVAILABLE" as const },
        ],
      },
      {
        name: "VTP Altair",
        slug: "vtp-altair",
        description: "The tallest residential towers in Kharadi, engineering luxury living with smart home technology, high-speed elevators, and sky wellness zones.",
        locationName: "Kharadi",
        locationSlug: "kharadi",
        address: "Near World Trade Center, Kharadi, Pune, Maharashtra 411014",
        mapsUrl: "https://maps.google.com/?q=Kharadi+WTC+Pune",
        status: "UPCOMING" as const,
        featured: false,
        publishStatus: "PUBLISHED" as const,
        highlights: [
          "Tallest residential towers in East Pune",
          "Smart home automation compatible with Alexa & Google Home",
          "Temperature-controlled rooftop infinity pool",
        ],
        amenities: ["Rooftop Infinity Pool", "Sky Gym", "Co-working Pods", "Gaming Zone", "EV Charging Hub"],
        configurations: [
          { name: "2 BHK", bhk: 2, carpetArea: 720, builtUpArea: 936, superBuiltUpArea: 1080, priceFrom: 6900000n, availabilityStatus: "AVAILABLE" as const },
          { name: "2 BHK Plus", bhk: 2, carpetArea: 840, builtUpArea: 1092, superBuiltUpArea: 1260, priceFrom: 8100000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK", bhk: 3, carpetArea: 1080, builtUpArea: 1404, superBuiltUpArea: 1620, priceFrom: 10900000n, availabilityStatus: "AVAILABLE" as const },
          { name: "3 BHK Plus", bhk: 3, carpetArea: 1290, builtUpArea: 1677, superBuiltUpArea: 1935, priceFrom: 13200000n, availabilityStatus: "LIMITED" as const },
          { name: "4 BHK", bhk: 4, carpetArea: 1620, builtUpArea: 2106, superBuiltUpArea: 2430, priceFrom: 17500000n, availabilityStatus: "AVAILABLE" as const },
        ],
      },
    ],
  },
];

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  console.log("==================================================");
  console.log("DEVELOPMENT REAL-ESTATE SEED INITIATED");
  console.log(`Target Database: ${dbUrl}`);
  console.log("==================================================\n");

  // Verify Admin accounts exist and report preservation
  const adminCount = await prisma.admin.count();
  console.log(`[AUTH CHECK] Preserving ${adminCount} Admin user account(s). Admin data will NOT be touched.\n`);

  // Clear property data cleanly to make seed repeatable
  console.log("[CLEANUP] Clearing existing property records (preserving Admin auth)...");
  await prisma.$transaction([
    prisma.media.deleteMany({}),
    prisma.lead.deleteMany({}),
    prisma.projectHighlight.deleteMany({}),
    prisma.projectAmenity.deleteMany({}),
    prisma.configuration.deleteMany({}),
    prisma.project.deleteMany({}),
    prisma.developer.deleteMany({}),
  ]);

  let totalDevelopers = 0;
  let totalProjects = 0;
  let totalConfigurations = 0;
  let totalHighlights = 0;
  let totalAmenities = 0;

  console.log("\n[SEEDING] Creating realistic Pune property dataset...");

  for (const devData of dataset) {
    const developer = await prisma.developer.create({
      data: {
        name: devData.name,
        slug: devData.slug,
        description: devData.description,
        websiteUrl: devData.websiteUrl,
        publishStatus: devData.publishStatus,
      },
    });
    totalDevelopers++;
    console.log(`\n  + Developer: ${developer.name} (${developer.slug})`);

    for (const projData of devData.projects) {
      const project = await prisma.project.create({
        data: {
          developerId: developer.id,
          name: projData.name,
          slug: projData.slug,
          description: projData.description,
          locationName: projData.locationName,
          locationSlug: projData.locationSlug,
          address: projData.address,
          mapsUrl: projData.mapsUrl,
          status: projData.status,
          featured: projData.featured,
          publishStatus: projData.publishStatus,
        },
      });
      totalProjects++;
      console.log(`    - Project: ${project.name} (${project.locationName}) [${project.status}]`);

      // Seed highlights
      for (let i = 0; i < projData.highlights.length; i++) {
        await prisma.projectHighlight.create({
          data: {
            projectId: project.id,
            text: projData.highlights[i],
            sortOrder: i,
          },
        });
        totalHighlights++;
      }

      // Seed amenities
      for (let i = 0; i < projData.amenities.length; i++) {
        await prisma.projectAmenity.create({
          data: {
            projectId: project.id,
            name: projData.amenities[i],
            sortOrder: i,
          },
        });
        totalAmenities++;
      }

      // Seed configurations
      for (const configData of projData.configurations) {
        await prisma.configuration.create({
          data: {
            projectId: project.id,
            name: configData.name,
            bhk: configData.bhk,
            carpetArea: configData.carpetArea,
            builtUpArea: configData.builtUpArea,
            superBuiltUpArea: configData.superBuiltUpArea,
            priceFrom: configData.priceFrom,
            availabilityStatus: configData.availabilityStatus,
          },
        });
        totalConfigurations++;
      }
    }
  }

  const mediaCount = await prisma.media.count();
  const preservedAdminCount = await prisma.admin.count();

  console.log("\n==================================================");
  console.log("SEEDING VERIFICATION SUMMARY");
  console.log("==================================================");
  console.table({
    "Developers Created": totalDevelopers,
    "Projects Created": totalProjects,
    "Configurations Created": totalConfigurations,
    "Highlights Created": totalHighlights,
    "Amenities Created": totalAmenities,
    "Media Records Created": mediaCount,
    "Admin Accounts Preserved": preservedAdminCount,
  });

  if (
    totalDevelopers === 3 &&
    totalProjects === 6 &&
    totalConfigurations === 30 &&
    mediaCount === 0 &&
    preservedAdminCount > 0
  ) {
    console.log("\n✓ SUCCESS: Synthetic text-only development dataset successfully seeded!");
  } else {
    console.warn("\nWARNING: Seeding verification numbers do not match expected targets!");
  }
}

main()
  .catch((err) => {
    console.error("CRITICAL ERROR DURING SEEDING:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
