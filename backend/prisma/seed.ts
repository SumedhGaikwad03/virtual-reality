import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const PASSWORD_SALT_ROUNDS = 12;

async function main() {
  const email = (
    process.env.ADMIN_SEED_EMAIL ?? "admin@example.com"
  )
    .trim()
    .toLowerCase();

  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    throw new Error(
      "ADMIN_SEED_PASSWORD is required to seed the development admin",
    );
  }

  if (password.length < 8) {
    throw new Error(
      "ADMIN_SEED_PASSWORD must be at least 8 characters",
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    PASSWORD_SALT_ROUNDS,
  );

  const admin = await prisma.admin.upsert({
    where: {
      email,
    },
    update: {
      passwordHash,
      name: process.env.ADMIN_SEED_NAME ?? "Admin",
      role: "FOUNDER",
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      name: process.env.ADMIN_SEED_NAME ?? "Admin",
      role: "FOUNDER",
      isActive: true,
    },
  });

  console.log(`Development admin ready: ${admin.email}`);

  const firmContact = await prisma.firmContact.upsert({
    where: {
      id: "default",
    },
    update: {},
    create: {
      id: "default",
      contactPersonName: "Dipankar Jagtap",
      phone: "+91 89996 43665",
      email: "dipankarjagtap@virtual2reality.in",
      address: "Office No. 202, 2nd Floor\nMspace Mall, Near Mahindra Antheia\nPimpri, Pune 411018",
      googleMapsUrl: null,
      whatsappUrl: "https://api.whatsapp.com/send/?phone=918999643665&text&type=phone_number&app_absent=0",
    },
  });

  console.log(`Firm contact initialized: ${firmContact.contactPersonName} (${firmContact.phone})`);

  const firmProfile = await prisma.firmProfile.upsert({
    where: {
      id: "default",
    },
    update: {},
    create: {
      id: "default",
      founderName: "Dipankar Jagtap",
      founderTitle: "Founder of Virtual Reality",
      founderExperience: "20+ years of experience in the real estate industry",
      founderBio: "Dipankar Jagtap has shaped the real estate landscape across Pune, delivering distinguished residential and commercial landmarks with exceptional architectural integrity.",
      founderImageMediaId: null,
      companyDescription: "Virtual Reality is a real-estate discovery platform showcasing prime residential developments and architectural landmarks.",
    },
  });

  console.log(`Firm profile initialized: ${firmProfile.founderName} - ${firmProfile.founderTitle}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });