import { Request, Response } from "express";
import prisma from "../../database/prisma";

export const criarVinculo = async (req: Request, res: Response) => {
  const { imovelId, proprietarioId } = req.body;

  if (!imovelId || !proprietarioId) {
    return res.status(422).json({
      mensagem: "Para criar um Vínculo, preencha todos os campos!",
    });
  } else {
    const vinculo = await prisma.vinculo.create({
      data: {
        imovelId,
        proprietarioId,
      },
    });

    return res.json(vinculo);
  }
};

export const pegarVinculos = async (req: Request, res: Response) => {
  const vinculos = await prisma.vinculo.findMany();

  return res.json(vinculos);
};

const VinculoController = {
  criarVinculo,
  pegarVinculos,
};
export default VinculoController;
