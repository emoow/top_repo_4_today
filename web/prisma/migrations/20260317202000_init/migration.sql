-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PickSource" AS ENUM ('star', 'fork');

-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepoSnapshot" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stars" INTEGER NOT NULL,
    "forks" INTEGER NOT NULL,
    "openIssues" INTEGER,
    "watchers" INTEGER,
    "defaultBranch" TEXT,
    "pushedAt" TIMESTAMP(3),
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languageMain" TEXT,
    "languagesJson" JSONB,
    "licenseSpdx" TEXT,
    "homepage" TEXT,
    "description" TEXT,
    "latestReleaseTag" TEXT,
    "latestReleaseAt" TIMESTAMP(3),
    "readmeSha" TEXT,
    "readmeExcerpt" TEXT,
    "derivedSignals" JSONB,

    CONSTRAINT "RepoSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pick" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rank" INTEGER NOT NULL,
    "source" "PickSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repoId" TEXT NOT NULL,
    "postId" TEXT,

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResummaryTrigger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT,

    CONSTRAINT "ResummaryTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repo_githubId_key" ON "Repo"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Repo_fullName_key" ON "Repo"("fullName");

-- CreateIndex
CREATE INDEX "Repo_owner_name_idx" ON "Repo"("owner", "name");

-- CreateIndex
CREATE INDEX "RepoSnapshot_repoId_capturedAt_idx" ON "RepoSnapshot"("repoId", "capturedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_repoId_createdAt_idx" ON "Post"("repoId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Pick_date_idx" ON "Pick"("date");

-- CreateIndex
CREATE INDEX "Pick_repoId_idx" ON "Pick"("repoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pick_date_source_rank_key" ON "Pick"("date", "source", "rank");

-- CreateIndex
CREATE INDEX "ResummaryTrigger_postId_idx" ON "ResummaryTrigger"("postId");

-- CreateIndex
CREATE INDEX "ResummaryTrigger_type_idx" ON "ResummaryTrigger"("type");

-- AddForeignKey
ALTER TABLE "RepoSnapshot" ADD CONSTRAINT "RepoSnapshot_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "RepoSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResummaryTrigger" ADD CONSTRAINT "ResummaryTrigger_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

