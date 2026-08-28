-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterEnum
ALTER TYPE "MediaCategory" ADD VALUE 'CARD';

-- AlterTable
ALTER TABLE "Developer" ADD COLUMN     "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "developerId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "ProjectHighlight" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAmenity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAmenity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectHighlight" ADD CONSTRAINT "ProjectHighlight_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAmenity" ADD CONSTRAINT "ProjectAmenity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

