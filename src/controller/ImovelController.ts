import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { ZodError } from "zod";
import { Prisma, RolePessoa, TipoImovel } from "@prisma/client";
import { Tipo_Imovel } from "../Models/Models";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

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

const upload = multer(); // Mantém a mesma configuração para upload de arquivos

// Função para fazer upload de fotos para Imóvel
export const uploadFotoImovel = async (req: Request, res: Response) => {
  try {
    const { imovelId } = req.params;

    console.log("Iniciando upload de fotos para Imóvel...");
    console.log("ID do Imóvel:", imovelId);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.log("Nenhum arquivo foi enviado.");
      return res.status(400).send("Nenhum arquivo foi enviado.");
    }

    const files = req.files as Express.Multer.File[];
    console.log("Número de arquivos recebidos:", files.length);

    // Verifica se o Imóvel existe
    const existingImovel = await prisma.imovel.findUnique({
      where: { id: imovelId },
    });

    if (!existingImovel) {
      console.log("Imóvel não encontrado.");
      return res.status(404).send("Imóvel não encontrado.");
    }

    const fotoRecords: Prisma.FotoImovelCreateManyInput[] = files.map(
      (file) => ({
        id: uuidv4(),
        base64: file.buffer.toString("base64"),
        mimetype: file.mimetype,
        imovelId: imovelId, // Adicionando o imovelId aqui
      })
    );

    // Cria as novas fotos para o Imóvel
    const fotosCriadas = await prisma.fotoImovel.createMany({
      data: fotoRecords,
    });

    console.log("Fotos criadas com sucesso:", fotosCriadas);

    res
      .status(200)
      .json({ fotosCriadas, message: "Arquivos carregados com sucesso." });
  } catch (error) {
    console.error("Erro durante o processamento dos arquivos:", error);
    res.status(500).send("Erro interno do servidor.");
  }
};
export const getFotosImovel = async (req: Request, res: Response) => {
  const { imovelId } = req.params;

  console.log("Buscando fotos para o Imóvel ID:", imovelId);

  try {
    // Busca o Imóvel pelo ID junto com suas fotos associadas
    const imovel = await prisma.imovel.findUnique({
      where: { id: imovelId },
      include: {
        FotoImovel: true, // Inclui todas as fotos associadas ao Imóvel
      },
    });

    if (!imovel) {
      console.log("Imóvel não encontrado.");
      return res.status(404).json({ message: "Imóvel não encontrado." });
    }

    console.log("Fotos encontradas para o Imóvel:", imovel.FotoImovel);

    // Retorna apenas os dados necessários para exibir no front-end
    const fotosParaExibir = imovel.FotoImovel.map((foto) => ({
      id: foto.id,
      base64: foto.base64,
      mimetype: foto.mimetype,
    }));

    res.status(200).json(fotosParaExibir);
  } catch (error) {
    console.error("Erro ao obter fotos do Imóvel:", error);
    res.status(500).send("Erro interno do servidor.");
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
