-- CreateEnum
CREATE TYPE "RentalEnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'MATCHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RentalPropertyStatus" AS ENUM ('NEW', 'VERIFIED', 'AVAILABLE', 'RENTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "RentalEnquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "configuration" TEXT NOT NULL,
    "location" TEXT,
    "areaLocality" TEXT,
    "budget" TEXT,
    "furnishing" TEXT,
    "moveInTimeframe" TEXT,
    "whoIsFor" TEXT,
    "notes" TEXT,
    "status" "RentalEnquiryStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalProperty" (
    "id" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "flatType" TEXT NOT NULL,
    "approxSizeSqFt" INTEGER,
    "location" TEXT,
    "areaLocality" TEXT,
    "societyDeveloper" TEXT,
    "additionalDetails" TEXT,
    "status" "RentalPropertyStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentalEnquiry_phone_idx" ON "RentalEnquiry"("phone");

-- CreateIndex
CREATE INDEX "RentalEnquiry_status_idx" ON "RentalEnquiry"("status");

-- CreateIndex
CREATE INDEX "RentalEnquiry_createdAt_idx" ON "RentalEnquiry"("createdAt");

-- CreateIndex
CREATE INDEX "RentalProperty_phone_idx" ON "RentalProperty"("phone");

-- CreateIndex
CREATE INDEX "RentalProperty_status_idx" ON "RentalProperty"("status");

-- CreateIndex
CREATE INDEX "RentalProperty_createdAt_idx" ON "RentalProperty"("createdAt");

