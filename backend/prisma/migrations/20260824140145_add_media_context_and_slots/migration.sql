/*
  Warnings:

  - Added the required column `context` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaContext" AS ENUM ('HOME', 'DEVELOPER', 'PROJECT', 'CONFIGURATION');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "context" "MediaContext" NOT NULL,
ADD COLUMN     "slot" TEXT;
