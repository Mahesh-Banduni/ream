/*
  Warnings:

  - You are about to drop the column `metadata` on the `final_reels` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `frame_images` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `frame_videos` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `frame_voice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "final_reels" DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "frame_images" DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "frame_videos" DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "frame_voice" DROP COLUMN "metadata";
