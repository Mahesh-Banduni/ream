/*
  Warnings:

  - You are about to drop the column `model` on the `frame_images` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `frame_images` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `frame_videos` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `frame_videos` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `frame_voice` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `frame_voice` table. All the data in the column will be lost.
  - You are about to drop the column `speaker` on the `frame_voice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "frame_images" DROP COLUMN "model",
DROP COLUMN "provider";

-- AlterTable
ALTER TABLE "frame_videos" DROP COLUMN "model",
DROP COLUMN "provider";

-- AlterTable
ALTER TABLE "frame_voice" DROP COLUMN "model",
DROP COLUMN "provider",
DROP COLUMN "speaker";
