-- DropIndex
DROP INDEX IF EXISTS "Project_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Project_developerId_slug_key" ON "Project"("developerId", "slug");
