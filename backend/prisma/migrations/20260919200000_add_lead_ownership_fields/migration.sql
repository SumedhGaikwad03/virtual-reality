-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Lead_createdById_idx" ON "Lead"("createdById");

-- CreateIndex
CREATE INDEX "Lead_ownerId_idx" ON "Lead"("ownerId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill existing leads to the primary active Founder
UPDATE "Lead"
SET "ownerId" = (
  SELECT "id" FROM "Admin"
  WHERE "role" = 'FOUNDER' AND "isActive" = true
  ORDER BY "createdAt" ASC, "id" ASC
  LIMIT 1
)
WHERE "ownerId" IS NULL;
