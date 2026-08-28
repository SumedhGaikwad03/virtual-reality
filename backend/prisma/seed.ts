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
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      name: process.env.ADMIN_SEED_NAME ?? "Admin",
      isActive: true,
    },
  });

  console.log(`Development admin ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });