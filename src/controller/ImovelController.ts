import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { ZodError } from "zod";
import { RolePessoa, TipoImovel } from "@prisma/client";
import { Tipo_Imovel } from "../Models/Models";

const HttpStatus = {
  Success: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  UnprocessableEntity: 422,
  InternalServerError: 500,
};

const gerarNumeroAleatorio = (): number => {
  return Math.floor(Math.random() * 10000) + 1;
};

const gerarIdUnico = async (): Promise<string> => {
  const id = `Imovel${gerarNumeroAleatorio()}`;
  const imovelExistente = await prisma.imovel.findUnique({
    where: {
      id,
    },
  });

  if (imovelExistente !== null) {
    return gerarIdUnico();
  } else {
    return id;
  }
};

export const buscarProprietarios = async (req: Request, res: Response) => {
  try {
    const proprietarios = await prisma.pessoa.findMany({
      where: {
        type: RolePessoa.Proprietario,
      },
      select: {
        id: true,
        cpf: true,
        firstName: true,
        middleName: true,
        lastName: true,
        tel: true,
        email: true,
        endereco: {
          select: {
            id: true,
            rua: true,
            complemento: true,
            numero: true,
            bairro: true,
            cidade: true,
            estado: true,
            cep: true,
          },
        },
      },
    });

    return res.status(HttpStatus.Success).json(proprietarios);
  } catch (error) {
    console.error("Erro ao buscar proprietários:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

// Rota para criar um imóvel e vinculá-lo a um proprietário existente
export const criarImovel = async (req: Request, res: Response) => {
  try {
    const {
      icm,
      tipo,
      rua,
      complemento,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      proprietarioId,
    } = req.body;

    // Verificar se o proprietário existe
    const proprietarioExistente = await prisma.pessoa.findUnique({
      where: {
        id: proprietarioId,
      },
    });

    if (!proprietarioExistente) {
      return res.status(404).json({ mensagem: "Proprietário não encontrado." });
    }

    const idImovel = await gerarIdUnico();
    const idVinculo = await gerarIdUnico();

    // Criar o imóvel
    const imovel = await prisma.imovel.create({
      data: {
        id: idImovel,
        icm,
        tipo,
        rua,
        complemento,
        numero,
        bairro,
        cidade,
        estado,
        cep,
      },
    });

    // Criar o vínculo
    const vinculo = await prisma.vinculo.create({
      data: {
        id: idVinculo,
        imovelId: idImovel,
        proprietarioId,
      },
    });

    // Agora, retornar apenas o ID do imóvel
    return res.status(HttpStatus.Created).json({ idImovel });
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);

    if (error instanceof ZodError) {
      console.error("Erros de validação:", error.errors);
      return res.status(422).json({
        mensagem: "Por favor, corrija os seguintes erros:",
        errors: error.errors,
      });
    }

    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Erro interno ao criar imóvel" });
  }
};

export const pegarImoveis = async (req: Request, res: Response) => {
  try {
    const imoveis = await prisma.imovel.findMany({
      include: {
        vinculo: {
          include: {
            proprietario: {
              select: {
                id: true,
                cpf: true,
                firstName: true,
                middleName: true,
                lastName: true,
                tel: true,
                email: true,
                endereco: {
                  select: {
                    id: true,
                    rua: true,
                    complemento: true,
                    numero: true,
                    bairro: true,
                    cidade: true,
                    estado: true,
                    cep: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.json(imoveis);
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    return res.status(500).json({ error: "Erro interno ao buscar imóveis" });
  }
};

export const atualizarImovel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { icm, tipo, rua, complemento, numero, bairro, cidade, estado, cep } =
      req.body;

    const imovelAtualizado = await prisma.imovel.update({
      where: { id },
      data: {
        icm,
        tipo,
        rua,
        complemento,
        numero,
        bairro,
        cidade,
        estado,
        cep,
      },
    });

    return res.json(imovelAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    return res.status(500).json({ error: "Erro interno ao atualizar imóvel" });
  }
};

export const pegarImovelPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: {
        vinculo: {
          include: {
            proprietario: {
              select: {
                id: true,
                cpf: true,
                firstName: true,
                middleName: true,
                lastName: true,
                tel: true,
                email: true,
                endereco: {
                  select: {
                    id: true,
                    rua: true,
                    complemento: true,
                    numero: true,
                    bairro: true,
                    cidade: true,
                    estado: true,
                    cep: true,
                  },
                },
              },
            },
          },
        },
        vistoria: true,
      },
    });

    if (!imovel) {
      return res.status(404).json({ mensagem: "Imóvel não encontrado." });
    }

    return res.json(imovel);
  } catch (error) {
    console.error("Erro ao buscar imóvel por ID:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar imóvel por ID" });
  }
};

export const excluirImovel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.imovel.delete({
      where: { id },
    });

    return res.json({ mensagem: "Imóvel excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir imóvel:", error);
    return res.status(500).json({ error: "Erro interno ao excluir imóvel" });
  }
};

export const pegarImovelPorNome = async (req: Request, res: Response) => {
  try {
    const { nome } = req.params;

    const imoveis = await prisma.imovel.findMany({
      where: {
        rua: {
          contains: nome,
        },
      },
      include: {
        vinculo: {
          include: {
            proprietario: {
              select: {
                id: true,
                cpf: true,
                firstName: true,
                middleName: true,
                lastName: true,
                tel: true,
                email: true,
                endereco: {
                  select: {
                    id: true,
                    rua: true,
                    complemento: true,
                    numero: true,
                    bairro: true,
                    cidade: true,
                    estado: true,
                    cep: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json(imoveis);
  } catch (error) {
    console.error("Erro ao buscar imóveis por nome:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

export const pegarImoveisPorTipo = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;

    const imoveis = await prisma.imovel.findMany({
      where: {
        tipo: tipo as Tipo_Imovel,
      },
      include: {
        vinculo: {
          include: {
            proprietario: {
              select: {
                id: true,
                cpf: true,
                firstName: true,
                middleName: true,
                lastName: true,
                tel: true,
                email: true,
                endereco: {
                  select: {
                    id: true,
                    rua: true,
                    complemento: true,
                    numero: true,
                    bairro: true,
                    cidade: true,
                    estado: true,
                    cep: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json(imoveis);
  } catch (error) {
    console.error("Erro ao buscar imóveis por tipo:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

export const pegarImovelPorICM = async (req: Request, res: Response) => {
  try {
    const { icm } = req.params;

    const imovel = await prisma.imovel.findUnique({
      where: {
        icm,
      },
      include: {
        vinculo: {
          include: {
            proprietario: {
              select: {
                id: true,
                cpf: true,
                firstName: true,
                middleName: true,
                lastName: true,
                tel: true,
                email: true,
                endereco: {
                  select: {
                    id: true,
                    rua: true,
                    complemento: true,
                    numero: true,
                    bairro: true,
                    cidade: true,
                    estado: true,
                    cep: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!imovel) {
      return res.status(404).json({
        mensagem: "Imóvel não encontrado",
      });
    }

    return res.status(200).json(imovel);
  } catch (error) {
    console.error("Erro ao buscar imóvel por ICM:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const ImovelController = {
  criarImovel,
  pegarImoveis,
  atualizarImovel,
  pegarImovelPorId,
  excluirImovel,
  pegarImovelPorICM,
  pegarImovelPorNome,
  pegarImoveisPorTipo,
};

export default ImovelController;
