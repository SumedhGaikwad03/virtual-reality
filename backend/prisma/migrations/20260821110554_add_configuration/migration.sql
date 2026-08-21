-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'LIMITED', 'SOLD_OUT');

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bhk" INTEGER NOT NULL,
    "carpetArea" INTEGER NOT NULL,
    "builtUpArea" INTEGER,
    "superBuiltUpArea" INTEGER,
    "priceFrom" BIGINT NOT NULL,
    "availabilityStatus" "AvailabilityStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);
