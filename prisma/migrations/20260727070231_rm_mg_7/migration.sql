-- AlterTable
ALTER TABLE "reels" ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "musicEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tone" TEXT,
ADD COLUMN     "voice" TEXT;

-- CreateTable
CREATE TABLE "reel_background_music" (
    "musicId" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "style_description" TEXT NOT NULL,
    "musicUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reel_background_music_pkey" PRIMARY KEY ("musicId")
);

-- CreateIndex
CREATE UNIQUE INDEX "reel_background_music_reelId_key" ON "reel_background_music"("reelId");

-- CreateIndex
CREATE INDEX "reel_background_music_reelId_idx" ON "reel_background_music"("reelId");

-- AddForeignKey
ALTER TABLE "reel_background_music" ADD CONSTRAINT "reel_background_music_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
