import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import prisma from "../../database/prisma";
const gerarNumeroAleatorio = (): number => {
  return Math.floor(Math.random() * 10000) + 1;
};

export const Alugar = async (req: Request, res: Response) => {
  try {
    console.log("Antes de criar o aluguel");

    const { inquilinoId, imovelId, dataSaida } = req.body;

    if (!inquilinoId || !imovelId) {
      return res.status(422).json({
        mensagem:
          "Para alugar um imóvel, forneça o ID do inquilino e o ID do imóvel.",
      });
    }

    // Verificar se o imóvel existe
    const imovelExistente = await prisma.imovel.findUnique({
      where: {
        id: imovelId,
      },
    });

    if (!imovelExistente) {
      return res.status(404).json({
        mensagem: "Imóvel não encontrado.",
      });
    }

    // Gerar manualmente o ID de Aluga
    const idAluguel = `Aluguel${gerarNumeroAleatorio()}`;

    // Criar aluguel
    const aluguel = await prisma.aluga.create({
      data: {
        id: idAluguel,
        imovel: { connect: { id: imovelId } },
        inquilino: { connect: { id: inquilinoId } },
        dataSaida: dataSaida || null,
      },
    });

    console.log("Aluguel criado:", aluguel);

    return res.json(aluguel);
  } catch (error) {
    console.error("Erro ao criar aluguel:", error);
    return res.status(500).json({ mensagem: "Erro ao alugar imóvel." });
  }
};

export const pegarAlugueis = async (req: Request, res: Response) => {
  const aluguel = await prisma.aluga.findMany();

  return res.json(aluguel);
};

const AlugaController = {
  Alugar,
  pegarAlugueis,
};
export default AlugaController;
