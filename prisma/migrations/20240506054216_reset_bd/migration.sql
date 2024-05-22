-- CreateEnum
CREATE TYPE "TipoVistoria" AS ENUM ('Entrada', 'Saida');

-- CreateEnum
CREATE TYPE "RolePessoa" AS ENUM ('Inquilino', 'Proprietario', 'Vistoriador', 'Adm', 'User');

-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('Casa', 'Apartamento', 'Terreno', 'Lote', 'Ponto', 'Rural');

-- CreateEnum
CREATE TYPE "TipoComodo" AS ENUM ('Sala', 'Corredor', 'BanheiroSocial', 'Banheiro', 'Quarto', 'Copa', 'Cozinha', 'Servico', 'BanheiroServico', 'Dispensa', 'Sacada', 'Outro');

-- CreateEnum
CREATE TYPE "Cor" AS ENUM ('Transparente', 'Incolor', 'Branco', 'BrancoGelo', 'RosaAcai', 'RosaAzaleia', 'Rubi', 'VermelhoCardinal', 'Vermelho', 'ColoradoVermelhoGoya', 'Pessego', 'Flamingo', 'LaranjaCitrico', 'LaranjaImperial', 'LaranjaMaracatu', 'LaranjaNeon', 'TerracotaSuave', 'Laranja', 'Ceramica', 'MarromConhaqueRoma', 'Areia', 'Creme', 'CromoSuave', 'OcreColonial', 'Ocre', 'MangabaGeada', 'Perola', 'Marfim', 'Palha', 'Vanilla', 'AmareloCanario', 'Sino', 'AmareloFrevo', 'AmareloDemarcacao', 'AmareloSeguranca', 'Amarelo', 'AmareloPadraoWandepoxy', 'Ouro', 'OuroCoral', 'AmareloTratorVerdeVale', 'VerdeVale', 'CapimLimao', 'Refresco', 'Verde', 'VerdeLimaoOrvalho', 'VerdePrimavera', 'Salvia', 'Mate', 'VerdeKiwi', 'VerdeAngra', 'VerdeNilo', 'VerdeClaro', 'VerdeTimbalada', 'VerdeQuadra', 'VerdeEscolar', 'VerdeFolha', 'VerdeEscuro', 'VerdeColonialVerdePiscina', 'Pavao', 'AzulPiscina', 'Oceanic', 'AzulPraia', 'AzulSereno', 'Marine', 'AzulArpoador', 'AzulDosAndes', 'Orquidea', 'Oceano', 'AzulMar', 'AzulSeguranca', 'LuaDoSertao', 'AzulProfundo', 'Azul', 'AzulFranca', 'AzulDelReyVioleta', 'LilasAreiaSirena', 'PedraPreciosa', 'CinzaAlpino', 'Prata', 'TubaraoBranco', 'Platina', 'CinzaMedio', 'CinzaPadraoWandepoxy', 'CinzaEscuro', 'CinzaPadraoFerrolack', 'PretoAlgodaoEgipcio', 'Cromio', 'BronzeLenda', 'Camurca', 'MadeiraAcinzentada', 'Concreto', 'Aluminio', 'Tabaco', 'VermelhoOxido', 'Marrom', 'Outro');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('IP', 'IA', 'NP', 'NA', 'UP', 'UA');

-- CreateEnum
CREATE TYPE "Material" AS ENUM ('Madeira', 'Alvenaria', 'Concreto', 'Aco', 'Vidro', 'Ceramica', 'Pedra', 'Gesso', 'PVC', 'Telha', 'Tinta', 'Carpete', 'Marmore', 'Granito', 'Laminado', 'Tijolo', 'Argamassa', 'TijolodeVidro', 'Ferro', 'Areia', 'Cimento', 'FerroForjado', 'Acrilico', 'Plastico', 'Metal', 'Bambu', 'FibradeVidro', 'PedraDecorativa', 'Drywall', 'PapeldeParede', 'PlacadeGesso', 'Asfalto', 'Palha', 'FolhasMetalicas', 'TelhadodeCeramica', 'TelhadodeMadeira', 'TelhadodeConcreto', 'Laje', 'PedraBritada', 'Outro');

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "enderecoId" TEXT NOT NULL,
    "type" "RolePessoa" NOT NULL DEFAULT 'Vistoriador',
    "birthDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endereco" (
    "id" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "complemento" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vinculo" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,

    CONSTRAINT "Vinculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL,
    "icm" VARCHAR(20) NOT NULL,
    "tipo" "TipoImovel" NOT NULL,
    "rua" TEXT NOT NULL,
    "complemento" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluga" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSaida" TIMESTAMP(3),

    CONSTRAINT "Aluga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comodo" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "tipo" "TipoComodo" NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "Comodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Componente" (
    "id" TEXT NOT NULL,
    "comodoId" TEXT NOT NULL,
    "vistoriaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "obs" TEXT NOT NULL,
    "cor" "Cor" NOT NULL,
    "estado" "Estado" NOT NULL,
    "material" "Material" NOT NULL,

    CONSTRAINT "Componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPrincipal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ItemPrincipal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemAcessorio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ItemAcessorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vistoria" (
    "id" TEXT NOT NULL,
    "tipo" "TipoVistoria" NOT NULL DEFAULT 'Entrada',
    "vistoriadorId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vistoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_id_key" ON "Pessoa"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_cpf_key" ON "Pessoa"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_email_key" ON "Pessoa"("email");

-- CreateIndex
CREATE INDEX "Pessoa_enderecoId_idx" ON "Pessoa"("enderecoId");

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_id_key" ON "Endereco"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Vinculo_id_key" ON "Vinculo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_id_key" ON "Imovel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_icm_key" ON "Imovel"("icm");

-- CreateIndex
CREATE UNIQUE INDEX "Aluga_id_key" ON "Aluga"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Comodo_id_key" ON "Comodo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Componente_id_key" ON "Componente"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPrincipal_id_key" ON "ItemPrincipal"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPrincipal_name_key" ON "ItemPrincipal"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ItemAcessorio_id_key" ON "ItemAcessorio"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ItemAcessorio_name_key" ON "ItemAcessorio"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vistoria_id_key" ON "Vistoria"("id");

-- AddForeignKey
ALTER TABLE "Pessoa" ADD CONSTRAINT "Pessoa_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "Endereco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vinculo" ADD CONSTRAINT "Vinculo_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vinculo" ADD CONSTRAINT "Vinculo_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluga" ADD CONSTRAINT "Aluga_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluga" ADD CONSTRAINT "Aluga_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comodo" ADD CONSTRAINT "Comodo_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Componente" ADD CONSTRAINT "Componente_comodoId_fkey" FOREIGN KEY ("comodoId") REFERENCES "Comodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Componente" ADD CONSTRAINT "Componente_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "Vistoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_vistoriadorId_fkey" FOREIGN KEY ("vistoriadorId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
