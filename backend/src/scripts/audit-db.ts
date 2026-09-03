import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function auditDatabase() {
  console.log("=== DATABASE INTEGRITY AUDIT ===");

  const admins = await prisma.admin.findMany();
  console.log(`Total Admins: ${admins.length} (Active: ${admins.filter((a) => a.isActive).length})`);

  const developers = await prisma.developer.findMany({
    include: {
      projects: true,
      media: true,
    },
  });
  console.log(`Total Developers: ${developers.length} (Published: ${developers.filter((d) => d.publishStatus === "PUBLISHED").length})`);

  const projects = await prisma.project.findMany({
    include: {
      developer: true,
      configurations: true,
      amenities: true,
      highlights: true,
      media: true,
    },
  });
  console.log(`Total Projects: ${projects.length} (Published: ${projects.filter((p) => p.publishStatus === "PUBLISHED").length})`);

  const configurations = await prisma.configuration.findMany({
    include: {
      project: true,
      media: true,
    },
  });
  console.log(`Total Configurations: ${configurations.length}`);

  const media = await prisma.media.findMany();
  console.log(`Total Media Assets: ${media.length} (Active: ${media.filter((m) => m.isActive).length})`);

  const leads = await prisma.lead.findMany();
  console.log(`Total Leads: ${leads.length} (NEW: ${leads.filter((l) => l.status === "NEW").length}, IN_PROGRESS: ${leads.filter((l) => l.status === "IN_PROGRESS").length}, DONE: ${leads.filter((l) => l.status === "DONE").length})`);

  // Integrity checks
  console.log("\n--- Integrity Verification ---");

  // 1. Media context & ownership validation
  let invalidMediaCount = 0;
  for (const m of media) {
    if (m.context === "HOME" && (m.developerId || m.projectId || m.configurationId)) {
      console.warn(`[CORRUPT MEDIA] Home media has entity owner: id=${m.id}`);
      invalidMediaCount++;
    }
    if (m.context === "DEVELOPER" && (!m.developerId || m.projectId || m.configurationId)) {
      console.warn(`[CORRUPT MEDIA] Developer media has invalid owners: id=${m.id}`);
      invalidMediaCount++;
    }
    if (m.context === "PROJECT" && (!m.projectId || m.configurationId)) {
      console.warn(`[CORRUPT MEDIA] Project media has invalid owners: id=${m.id}`);
      invalidMediaCount++;
    }
    if (m.context === "CONFIGURATION" && !m.configurationId) {
      console.warn(`[CORRUPT MEDIA] Configuration media missing configurationId: id=${m.id}`);
      invalidMediaCount++;
    }
  }
  console.log(`Media context-owner violations: ${invalidMediaCount}`);

  // 2. Orphaned configurations
  const orphanedConfigs = configurations.filter((c) => !c.project);
  console.log(`Orphaned configurations: ${orphanedConfigs.length}`);

  // 3. Projects without configurations
  const projectsWithoutConfigs = projects.filter((p) => p.configurations.length === 0);
  console.log(`Projects without configurations: ${projectsWithoutConfigs.length}`);

  // 4. Projects without developer
  const projectsWithoutDev = projects.filter((p) => !p.developer);
  console.log(`Projects without developer: ${projectsWithoutDev.length}`);

  // 5. Media breakdowns by context
  const homeMedia = media.filter((m) => m.context === "HOME");
  const devMedia = media.filter((m) => m.context === "DEVELOPER");
  const projMedia = media.filter((m) => m.context === "PROJECT");
  const configMedia = media.filter((m) => m.context === "CONFIGURATION");
  console.log(`Media breakdown -> HOME: ${homeMedia.length}, DEVELOPER: ${devMedia.length}, PROJECT: ${projMedia.length}, CONFIGURATION: ${configMedia.length}`);

  await prisma.$disconnect();
}

auditDatabase().catch((e) => {
  console.error("DB Audit Failed:", e);
  process.exit(1);
});
