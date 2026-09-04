-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('FOUNDER', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'EMPLOYEE';

-- CreateTable
CREATE TABLE "FirmContact" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "contactPersonName" TEXT NOT NULL DEFAULT 'Dipankar Jagtap',
    "phone" TEXT NOT NULL DEFAULT '+91 89996 43665',
    "email" TEXT NOT NULL DEFAULT 'dipankarjagtap@virtual2reality.in',
    "address" TEXT NOT NULL DEFAULT 'Office No. 202, 2nd Floor
Mspace Mall, Near Mahindra Antheia
Pimpri, Pune 411018',
    "googleMapsUrl" TEXT,
    "whatsappUrl" TEXT NOT NULL DEFAULT 'https://api.whatsapp.com/send/?phone=918999643665&text&type=phone_number&app_absent=0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirmContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "founderName" TEXT NOT NULL DEFAULT 'Dipankar Jagtap',
    "founderTitle" TEXT NOT NULL DEFAULT 'Founder of Virtual Reality',
    "founderExperience" TEXT NOT NULL DEFAULT '20+ years of experience in the real estate industry',
    "founderBio" TEXT,
    "founderImageMediaId" TEXT,
    "companyDescription" TEXT DEFAULT 'Virtual Reality is a real-estate discovery platform showcasing prime residential developments and architectural landmarks.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirmProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FirmProfile_founderImageMediaId_idx" ON "FirmProfile"("founderImageMediaId");

-- AddForeignKey
ALTER TABLE "FirmProfile" ADD CONSTRAINT "FirmProfile_founderImageMediaId_fkey" FOREIGN KEY ("founderImageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
