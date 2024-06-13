/*
  Warnings:

  - You are about to drop the column `fotos` on the `Componente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Componente" DROP COLUMN "fotos";

-- CreateTable
CREATE TABLE "FotoComponente" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "componenteId" TEXT NOT NULL,

    CONSTRAINT "FotoComponente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FotoComponente_id_key" ON "FotoComponente"("id");

-- AddForeignKey
ALTER TABLE "FotoComponente" ADD CONSTRAINT "FotoComponente_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "Componente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
