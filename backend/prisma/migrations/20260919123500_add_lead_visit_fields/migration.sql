-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "visitDate" TEXT,
ADD COLUMN     "visitTime" TEXT;

-- CreateIndex
CREATE INDEX "Lead_visitDate_idx" ON "Lead"("visitDate");
