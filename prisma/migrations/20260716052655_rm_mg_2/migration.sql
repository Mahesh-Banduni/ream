/*
  Warnings:

  - You are about to drop the `reel_reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reel_reviews" DROP CONSTRAINT "reel_reviews_reelId_fkey";

-- AlterTable
ALTER TABLE "reels" ALTER COLUMN "body" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "reel_reviews";
