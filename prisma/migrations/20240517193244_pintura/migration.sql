-- AlterEnum
ALTER TYPE "Material" ADD VALUE 'Pintura';

-- AlterTable
ALTER TABLE "Pessoa" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
