-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MediaCategory" ADD VALUE 'DEVELOPER_BANNER';
ALTER TYPE "MediaCategory" ADD VALUE 'DEVELOPER_HERO';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "developerId" TEXT;

-- CreateIndex
CREATE INDEX "Lead_developerId_idx" ON "Lead"("developerId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
