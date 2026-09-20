-- AlterTable
ALTER TABLE "RentalEnquiry" ADD COLUMN     "createdById" TEXT;

-- CreateIndex
CREATE INDEX "RentalEnquiry_createdById_idx" ON "RentalEnquiry"("createdById");

-- AddForeignKey
ALTER TABLE "RentalEnquiry" ADD CONSTRAINT "RentalEnquiry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
