/*
  Warnings:

  - You are about to drop the column `url` on the `FotoComponente` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `FotoImovel` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `FotoPessoa` table. All the data in the column will be lost.
  - Added the required column `mimetype` to the `FotoComponente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base64` to the `FotoImovel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `FotoImovel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base64` to the `FotoPessoa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `FotoPessoa` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FotoComponente_id_key";

-- AlterTable
ALTER TABLE "FotoComponente" DROP COLUMN "url",
ADD COLUMN     "mimetype" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FotoImovel" DROP COLUMN "url",
ADD COLUMN     "base64" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FotoPessoa" DROP COLUMN "url",
ADD COLUMN     "base64" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL;
