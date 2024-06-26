/*
  Warnings:

  - Added the required column `base64` to the `FotoComponente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FotoComponente" ADD COLUMN     "base64" TEXT NOT NULL;
