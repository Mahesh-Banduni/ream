-- CreateEnum
CREATE TYPE "ReelStatus" AS ENUM ('DRAFT', 'SCRIPT_GENERATED', 'REVIEWING', 'REVIEWED', 'STORYBOARD_GENERATED', 'IMAGES_GENERATING', 'VOICES_GENERATING', 'VIDEOS_GENERATING', 'RENDERING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "reels" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "status" "ReelStatus" NOT NULL DEFAULT 'DRAFT',
    "hook" TEXT,
    "ending" TEXT,
    "body" JSONB,
    "reviewScore" DOUBLE PRECISION,
    "reviewApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reel_reviews" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generationAttempt" INTEGER NOT NULL DEFAULT 1,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "audienceRelevance" DOUBLE PRECISION NOT NULL,
    "engagementRetention" DOUBLE PRECISION NOT NULL,
    "scriptQuality" DOUBLE PRECISION NOT NULL,
    "strengths" JSONB NOT NULL,
    "improvements" JSONB NOT NULL,
    "feedback" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reel_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reel_frames" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "narration" TEXT NOT NULL,
    "visualDescription" TEXT NOT NULL,
    "imagePrompt" TEXT NOT NULL,
    "cameraShot" TEXT NOT NULL,
    "cameraMovement" TEXT NOT NULL,
    "transition" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reel_frames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame_voice" (
    "id" TEXT NOT NULL,
    "frameId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generationAttempt" INTEGER NOT NULL DEFAULT 1,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "speaker" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "audioUrl" TEXT,
    "duration" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_voice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame_images" (
    "id" TEXT NOT NULL,
    "frameId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generationAttempt" INTEGER NOT NULL DEFAULT 1,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame_videos" (
    "id" TEXT NOT NULL,
    "frameId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generationAttempt" INTEGER NOT NULL DEFAULT 1,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "prompt" TEXT NOT NULL,
    "videoUrl" TEXT,
    "duration" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_reels" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "final_reels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reel_reviews_reelId_idx" ON "reel_reviews"("reelId");

-- CreateIndex
CREATE INDEX "reel_frames_reelId_idx" ON "reel_frames"("reelId");

-- CreateIndex
CREATE UNIQUE INDEX "reel_frames_reelId_orderId_key" ON "reel_frames"("reelId", "orderId");

-- CreateIndex
CREATE INDEX "frame_voice_frameId_idx" ON "frame_voice"("frameId");

-- CreateIndex
CREATE INDEX "frame_images_frameId_idx" ON "frame_images"("frameId");

-- CreateIndex
CREATE INDEX "frame_videos_frameId_idx" ON "frame_videos"("frameId");

-- CreateIndex
CREATE UNIQUE INDEX "final_reels_reelId_key" ON "final_reels"("reelId");

-- AddForeignKey
ALTER TABLE "reel_reviews" ADD CONSTRAINT "reel_reviews_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reel_frames" ADD CONSTRAINT "reel_frames_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frame_voice" ADD CONSTRAINT "frame_voice_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "reel_frames"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frame_images" ADD CONSTRAINT "frame_images_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "reel_frames"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frame_videos" ADD CONSTRAINT "frame_videos_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "reel_frames"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_reels" ADD CONSTRAINT "final_reels_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
