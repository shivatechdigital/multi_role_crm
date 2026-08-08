-- CreateTable
CREATE TABLE "BlogDistribution" (
    "id" TEXT NOT NULL,
    "blogId" TEXT,
    "blogTitle" TEXT NOT NULL,
    "blogSlug" TEXT NOT NULL,
    "blogUrl" TEXT NOT NULL,
    "blogExcerpt" TEXT,
    "blogContent" TEXT,
    "blogImage" TEXT,
    "blogCategory" TEXT,
    "blogTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalPlatforms" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BlogDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformPost" (
    "id" TEXT NOT NULL,
    "distributionId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformPostId" TEXT,
    "platformUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "postedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformConfig" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "credentials" JSONB,
    "postDelay" INTEGER NOT NULL DEFAULT 60,
    "customTemplate" TEXT,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "successfulPosts" INTEGER NOT NULL DEFAULT 0,
    "failedPosts" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogDistribution_blogId_idx" ON "BlogDistribution"("blogId");

-- CreateIndex
CREATE INDEX "BlogDistribution_status_idx" ON "BlogDistribution"("status");

-- CreateIndex
CREATE INDEX "BlogDistribution_triggeredAt_idx" ON "BlogDistribution"("triggeredAt");

-- CreateIndex
CREATE INDEX "PlatformPost_platform_idx" ON "PlatformPost"("platform");

-- CreateIndex
CREATE INDEX "PlatformPost_status_idx" ON "PlatformPost"("status");

-- CreateIndex
CREATE INDEX "PlatformPost_distributionId_idx" ON "PlatformPost"("distributionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConfig_platform_key" ON "PlatformConfig"("platform");

-- AddForeignKey
ALTER TABLE "PlatformPost" ADD CONSTRAINT "PlatformPost_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "BlogDistribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
