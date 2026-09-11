/*
  Warnings:

  - Added the required column `city` to the `complaints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "city" TEXT NOT NULL;
