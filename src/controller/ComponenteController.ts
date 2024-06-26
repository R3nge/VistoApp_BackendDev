import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const HttpStatus = {
  Success: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  UnprocessableEntity: 422,
  InternalServerError: 500,
};

// Função para fazer upload de fotos do componente
export const uploadFotoComponente = async (req: any, res: any) => {
  try {
    const { componenteId, tipo } = req.params;
    const { vistoriaId, nome } = req.body;

    if (!req.files || !Array.isArray(req.files)) {
      return res.status(HttpStatus.BadRequest).send("Nenhum arquivo foi enviado.");
    }

    const files = req.files as Express.Multer.File[];

    // Verifica se o componente existe
    const existingComponente = await prisma.componente.findUnique({
      where: { id: componenteId },
    });

    if (!existingComponente) {
      return res.status(HttpStatus.NotFound).send("Componente não encontrado.");
    }

    const fotoRecords = files.map(file => ({
      id: uuidv4(),
      base64: file.buffer.toString('base64'),
      mimetype: file.mimetype,
      componenteId,
    }));

    // Atualizar o registro do componente com as novas fotos
    const componente = await prisma.componente.update({
      where: { id: componenteId },
      data: {
        fotos: {
          create: fotoRecords,
        },
      },
      include: {
        fotos: true,
      },
    });

    res.status(HttpStatus.Success).json({ componente, message: "Arquivos carregados com sucesso." });
  } catch (error) {
    console.error("Erro durante o processamento dos arquivos:", error);
    res.status(HttpStatus.InternalServerError).send("Erro interno do servidor.");
  }
};

// Função para buscar as fotos de um componente
export const getFotosComponente = async (req: Request, res: Response) => {
  const { componenteId } = req.params;

  try {
    // Busca o componente pelo ID junto com suas fotos associadas
    const componente = await prisma.componente.findUnique({
      where: { id: componenteId },
      include: {
        fotos: true, // Inclui todas as fotos associadas ao componente
      },
    });

    if (!componente) {
      return res.status(HttpStatus.NotFound).json({ message: "Componente não encontrado." });
    }

    res.status(HttpStatus.Success).json(componente.fotos);
  } catch (error) {
    console.error("Erro ao obter fotos do componente:", error);
    res.status(HttpStatus.InternalServerError).send("Erro interno do servidor.");
  }
};

const gerarIdUnico = async (prefixo: string): Promise<string> => {
  const id = `${prefixo}${uuidv4().substr(0, 10)}`; // Use os primeiros 4 caracteres do UUID
  const componenteExistente = await prisma.componente.findUnique({
    where: {
      id,
    },
  });

  if (componenteExistente !== null) {
    return gerarIdUnico(prefixo);
  } else {
    return id;
  }
};

export const criarComponente = async (req: Request, res: Response) => {
  try {
    const { vistoriaId, comodoId } = req.params;
    const { tipo, obs, cor, estado, material } = req.body;

    const id = uuidv4();

    const componente = await prisma.componente.create({
      data: {
        id,
        comodoId,
        vistoriaId,
        tipo,
        obs,
        cor,
        estado,
        material,
      },
    });

    return res.status(HttpStatus.Created).json(componente);
  } catch (error) {
    console.error("Erro ao criar Componente", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const obterUltimaVistoriaUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const ultimaVistoria = await prisma.vistoria.findFirst({
      orderBy: {
        data: "desc", // Ordena por data de criação decrescente para obter a última vistoria
      },
      select: {
        id: true,
      },
    });

    return res.status(HttpStatus.Success).json(ultimaVistoria);
  } catch (error) {
    console.error("Erro ao obter a última vistoria do usuário", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Erro ao desconectar do banco de dados", disconnectError);
    }
  }
};

export const obterUltimoComodoUsuario = async (req: Request, res: Response) => {
  try {
    const ultimoComodo = await prisma.comodo.findFirst({
      orderBy: {
        id: "desc", // Ordena por ID decrescente para obter o último comodo
      },
      select: {
        id: true,
      },
    });

    return res.status(HttpStatus.Success).json(ultimoComodo);
  } catch (error) {
    console.error("Erro ao obter o último comodo do usuário", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Erro ao desconectar do banco de dados", disconnectError);
    }
  }
};

export const atualizarComponente = async (req: Request, res: Response) => {
  try {
    const { componenteId, comodoId } = req.params; // Extrai os IDs da URL
    const { tipo, obs, cor, estado, material } = req.body; // Extrai os dados do corpo da requisição

    // Verifica se o comodoId foi fornecido
    if (!comodoId) {
      return res
        .status(HttpStatus.BadRequest)
        .json({ mensagem: "O ID do cômodo deve ser fornecido." });
    }

    const componente = await prisma.componente.update({
      where: { id: componenteId }, // Usa o componenteId extraído da URL
      data: {
        comodoId,
        tipo,
        obs,
        cor,
        estado,
        material,
      },
    });

    return res.status(HttpStatus.Success).json(componente);
  } catch (error) {
    console.error("Erro ao atualizar Componente", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const buscarComponentesPorComodo = async (
  req: Request,
  res: Response
) => {
  try {
    const { comodoId } = req.params;

    const componentes = await prisma.componente.findMany({
      where: {
        comodoId,
      },
    });

    return res.status(HttpStatus.Success).json(componentes);
  } catch (error) {
    console.error("Erro ao buscar Componentes por Comodo", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const excluirComponente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o componente existe
    const componente = await prisma.componente.findUnique({
      where: { id },
    });

    if (!componente) {
      return res.status(404).json({
        mensagem: "Componente não encontrado",
      });
    }

    // Excluir o componente
    await prisma.componente.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      mensagem: "Componente excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir Componente", error);
    return res.status(500).json({
      mensagem: "Erro interno do servidor",
    });
  } finally {
    await prisma.$disconnect();
  }
};

const ComponenteController = {
  criarComponente,
  atualizarComponente,
  excluirComponente,
  obterUltimaVistoriaUsuario,
  obterUltimoComodoUsuario,
  buscarComponentesPorComodo,
  uploadFotoComponente,
  getFotosComponente,
};

export default ComponenteController;
