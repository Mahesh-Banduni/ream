/*
  Warnings:

  - You are about to drop the column `clientId` on the `final_reels` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `reels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "final_reels" DROP CONSTRAINT "final_reels_clientId_fkey";

-- AlterTable
ALTER TABLE "final_reels" DROP COLUMN "clientId";

-- AlterTable
ALTER TABLE "reels" ADD COLUMN     "clientId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "reels" ADD CONSTRAINT "reels_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;
