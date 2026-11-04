/*
  Warnings:

  - You are about to drop the column `repositoryUrl` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectRepositoryType" AS ENUM ('BACKEND', 'FRONTEND', 'OTHER');

-- CreateTable
CREATE TABLE "ProjectRepository" (
    "id" UUID NOT NULL,
    "type" "ProjectRepositoryType" NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "projectId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProjectRepository_pkey" PRIMARY KEY ("id")
);

-- Migrate existing repository URLs
INSERT INTO "ProjectRepository" (
    "id",
    "type",
    "url",
    "displayOrder",
    "projectId",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid(),
    'OTHER'::"ProjectRepositoryType",
    "repositoryUrl",
    0,
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Project"
WHERE "repositoryUrl" IS NOT NULL;

-- Remove old column after preserving its data
ALTER TABLE "Project" DROP COLUMN "repositoryUrl";

-- CreateIndex
CREATE INDEX "ProjectRepository_projectId_displayOrder_idx"
ON "ProjectRepository"("projectId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRepository_projectId_url_key"
ON "ProjectRepository"("projectId", "url");

-- AddForeignKey
ALTER TABLE "ProjectRepository"
ADD CONSTRAINT "ProjectRepository_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;