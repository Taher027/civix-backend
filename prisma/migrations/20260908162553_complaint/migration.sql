/*
  Warnings:

  - You are about to drop the column `images` on the `complaints` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "complaints" DROP COLUMN "images",
ADD COLUMN     "initialImages" TEXT[],
ADD COLUMN     "resolvedImages" TEXT[];
