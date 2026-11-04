-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('GITHUB', 'LINKEDIN', 'EMAIL', 'WEBSITE', 'X', 'YOUTUBE', 'INSTAGRAM', 'DISCORD', 'CUSTOM', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ProjectImageType" AS ENUM ('COVER', 'GALLERY');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'FREELANCE', 'VOLUNTEERING', 'PERSONAL_PROJECT', 'OTHER');

-- CreateEnum
CREATE TYPE "EducationType" AS ENUM ('FORMAL', 'CERTIFICATION', 'COURSE', 'SPECIALIZATION', 'OTHER');

-- CreateTable
CREATE TABLE "Profile" (
    "id" VARCHAR(20) NOT NULL DEFAULT 'main',
    "fullName" VARCHAR(120) NOT NULL,
    "headline" VARCHAR(160) NOT NULL,
    "shortBio" VARCHAR(280) NOT NULL,
    "biography" TEXT NOT NULL,
    "location" VARCHAR(120),
    "email" VARCHAR(254),
    "photoUrl" TEXT,
    "photoPublicId" VARCHAR(255),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" UUID NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "label" VARCHAR(80) NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "profileId" VARCHAR(20) NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(150),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "shortDescription" VARCHAR(280) NOT NULL,
    "description" TEXT NOT NULL,
    "repositoryUrl" VARCHAR(2048),
    "demoUrl" VARCHAR(2048),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATE,
    "endDate" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" UUID NOT NULL,
    "type" "ProjectImageType" NOT NULL,
    "publicId" VARCHAR(255) NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "alt" VARCHAR(250) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "format" VARCHAR(20) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "projectId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSkill" (
    "projectId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectSkill_pkey" PRIMARY KEY ("projectId","skillId")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" UUID NOT NULL,
    "company" VARCHAR(160) NOT NULL,
    "jobTitle" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(120),
    "employmentType" "EmploymentType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "profileId" VARCHAR(20) NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" UUID NOT NULL,
    "institution" VARCHAR(160) NOT NULL,
    "degree" VARCHAR(160) NOT NULL,
    "fieldOfStudy" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(120),
    "type" "EducationType" NOT NULL DEFAULT 'FORMAL',
    "credentialUrl" VARCHAR(2048),
    "startDate" DATE,
    "endDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "profileId" VARCHAR(20) NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialLink_profileId_isActive_displayOrder_idx" ON "SocialLink"("profileId", "isActive", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_name_key" ON "SkillCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_slug_key" ON "SkillCategory"("slug");

-- CreateIndex
CREATE INDEX "SkillCategory_isActive_displayOrder_idx" ON "SkillCategory"("isActive", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_categoryId_isActive_displayOrder_idx" ON "Skill"("categoryId", "isActive", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_isFeatured_displayOrder_idx" ON "Project"("status", "isFeatured", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectImage_publicId_key" ON "ProjectImage"("publicId");

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_type_displayOrder_idx" ON "ProjectImage"("projectId", "type", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectImage_projectId_key" ON "ProjectImage"("projectId") WHERE ("type" = 'COVER');

-- CreateIndex
CREATE UNIQUE INDEX "ProjectImage_projectId_displayOrder_key" ON "ProjectImage"("projectId", "displayOrder") WHERE ("type" = 'GALLERY');

-- CreateIndex
CREATE INDEX "ProjectSkill_skillId_idx" ON "ProjectSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSkill_projectId_displayOrder_key" ON "ProjectSkill"("projectId", "displayOrder");

-- CreateIndex
CREATE INDEX "Experience_profileId_isActive_displayOrder_idx" ON "Experience"("profileId", "isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "Education_profileId_isActive_displayOrder_idx" ON "Education"("profileId", "isActive", "displayOrder");

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint: Profile
ALTER TABLE "Profile"
ADD CONSTRAINT "Profile_singleton_id_check"
CHECK ("id" = 'main');

ALTER TABLE "Profile"
ADD CONSTRAINT "Profile_photo_fields_check"
CHECK (
    ("photoUrl" IS NULL AND "photoPublicId" IS NULL)
    OR
    ("photoUrl" IS NOT NULL AND "photoPublicId" IS NOT NULL)
);

ALTER TABLE "Profile"
ADD CONSTRAINT "Profile_published_requires_photo_check"
CHECK (
    NOT "isPublished"
    OR ("photoUrl" IS NOT NULL AND "photoPublicId" IS NOT NULL)
);

-- AddCheckConstraint: Project

ALTER TABLE "Project"
ADD CONSTRAINT "Project_dates_check"
CHECK (
    "startDate" IS NULL
    OR "endDate" IS NULL
    OR "endDate" >= "startDate"
);

-- AddCheckConstraint: ProjectImage

ALTER TABLE "ProjectImage"
ADD CONSTRAINT "ProjectImage_dimensions_check"
CHECK ("width" > 0 AND "height" > 0);

-- AddCheckConstraint: Experience

ALTER TABLE "Experience"
ADD CONSTRAINT "Experience_dates_check"
CHECK (
    "endDate" IS NULL
    OR "endDate" >= "startDate"
);

ALTER TABLE "Experience"
ADD CONSTRAINT "Experience_current_check"
CHECK (
    NOT "isCurrent"
    OR "endDate" IS NULL
);

-- AddCheckConstraint: Education

ALTER TABLE "Education"
ADD CONSTRAINT "Education_dates_check"
CHECK (
    "startDate" IS NULL
    OR "endDate" IS NULL
    OR "endDate" >= "startDate"
);

ALTER TABLE "Education"
ADD CONSTRAINT "Education_current_check"
CHECK (
    NOT "isCurrent"
    OR "endDate" IS NULL
);
