-- CreateTable
CREATE TABLE "FotoImovel" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,

    CONSTRAINT "FotoImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoPessoa" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,

    CONSTRAINT "FotoPessoa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FotoImovel_id_key" ON "FotoImovel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FotoPessoa_id_key" ON "FotoPessoa"("id");

-- AddForeignKey
ALTER TABLE "FotoImovel" ADD CONSTRAINT "FotoImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoPessoa" ADD CONSTRAINT "FotoPessoa_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
