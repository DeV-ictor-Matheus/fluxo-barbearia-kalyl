/*
  Warnings:

  - Added the required column `data` to the `Saida` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descricao` to the `Saida` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `categoria` on the `Saida` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CategoriaSaida" AS ENUM ('ALUGUEL', 'TAXA_CARTAO', 'PRODUTOS', 'ALUGUEL_POS', 'SALARIO', 'CONTAS', 'MARKETING', 'OUTROS');

-- AlterTable
ALTER TABLE "Saida" ADD COLUMN     "data" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "descricao" TEXT NOT NULL,
DROP COLUMN "categoria",
ADD COLUMN     "categoria" "CategoriaSaida" NOT NULL;
