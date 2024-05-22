import { PDFDocument, PDFFont, rgb, StandardFonts } from "pdf-lib";
const fs = require("fs").promises;
const path = require("path");
import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid";
import { TipoVistoria } from "@prisma/client";

interface DadosVistoria {
  id: string;
  data: Date;
  imovel: {
    [x: string]: any;
    rua: string;
    numero: number;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    comodo: {
      numero: number;
      tipo: string;
      componente: {
        [x: string]: string;
        obs: any;
        cor: any;
        material: any;
        tipo: string;
        estado: string;
      }[];
    }[];
  };
}

let fonte: any;

const HttpStatus = {
  Sucesso: 200,
  Criado: 201,
  RequisicaoInvalida: 400,
  NaoEncontrado: 404,
  EntidadeNaoProcessavel: 422,
  ErroInternoServidor: 500,
};

const gerarIdUnico = (): string => {
  return `Vistoria${uuidv4().substr(0, 4)}`;
};

export const criarVistoria = async (req: Request, res: Response) => {
  try {
    const { vistoriadorId, tipo } = req.body;
    const { imovelId } = req.params;

    const imovelExistente = await prisma.imovel.findUnique({
      where: {
        id: imovelId,
      },
    });

    if (!imovelExistente) {
      return res.status(HttpStatus.RequisicaoInvalida).json({ mensagem: "Imóvel não encontrado." });
    }

    // Verificar se já existe uma vistoria em andamento para o mesmo imóvel e tipo
    const vistoriaExistente = await prisma.vistoria.findFirst({
      where: {
        imovelId,
        tipo: tipo || "Entrada",
        // Você pode adicionar mais condições aqui para definir o que significa "em andamento"
      },
      orderBy: {
        data: "desc",
      },
    });

    if (vistoriaExistente) {
      // Vistoria já em andamento encontrada, continuar nela
      return res.status(HttpStatus.Sucesso).json({
        mensagem: "Vistoria já em andamento encontrada.",
        vistoriaId: vistoriaExistente.id,
        imovelId,
      });
    }

    // Criar nova vistoria se não houver uma em andamento
    const id = gerarIdUnico();
    const novaVistoria = await prisma.vistoria.create({
      data: {
        id,
        vistoriadorId,
        imovelId,
        tipo: tipo || "Entrada",
        data: new Date(),
      },
    });

    return res.status(HttpStatus.Criado).json({
      mensagem: "Nova vistoria criada com sucesso.",
      vistoriaId: novaVistoria.id,
      imovelId,
    });
  } catch (error) {
    console.error("Erro ao criar vistoria:", error);

    if (error instanceof ZodError) {
      console.error("Erros de validação:", error.errors);
      return res.status(HttpStatus.EntidadeNaoProcessavel).json({
        mensagem: "Por favor, corrija os seguintes erros:",
        errors: error.errors,
      });
    }

    return res.status(HttpStatus.ErroInternoServidor).json({ error: "Erro interno ao criar vistoria" });
  }
};

export const pegarVistoriaCompleta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Assumindo que o ID da vistoria é passado nos parâmetros da requisição

    const vistoriaCompleta = await prisma.vistoria.findUnique({
      where: { id },
      include: {
        imovel: {
          include: {
            comodo: {
              include: {
                componente: true,
              },
            },
          },
        },
        vistoriador: true, // Inclui o vistoriador associado à vistoria
      },
    });

    if (!vistoriaCompleta) {
      return res.status(404).json({ mensagem: "Vistoria não encontrada." });
    }

    return res.json(vistoriaCompleta);
  } catch (error) {
    console.error("Erro ao buscar vistoria completa:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar vistoria completa" });
  } finally {
    await prisma.$disconnect();
  }
};

export const obterVistorias = async (
  req: Request,
  res: Response,
  searchText?: unknown,
  sortType?: unknown
) => {
  try {
    const vistorias = await prisma.vistoria.findMany({
      include: {
        imovel: {
          include: {
            comodo: {
              include: {
                componente: true,
              },
            },
          },
        },
        vistoriador: true, // Inclui o vistoriador associado à vistoria
      },
    });

    if (!vistorias) {
      return res.status(404).json({ mensagem: "Vistoria não encontrada." });
    }

    return res.json(vistorias);
  } catch (error) {
    console.error("Erro ao buscar vistorias:", error);
    return res.status(500).json({ error: "Erro interno ao buscar vistorias" });
  }
};

export const obterUltimaVistoria = async (req: Request, res: Response) => {
  try {
    const ultimaVistoria = await prisma.vistoria.findFirst({
      orderBy: {
        data: "desc", // Ordena pela data em ordem decrescente para obter a última vistoria
      },
    });

    if (!ultimaVistoria) {
      return res
        .status(404)
        .json({ mensagem: "Nenhuma vistoria encontrada para este imóvel." });
    }

    return res.json(ultimaVistoria);
  } catch (error) {
    console.error("Erro ao obter a última vistoria:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao obter a última vistoria" });
  }
};

export const atualizarVistoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vistoriadorId, imovelId, data } = req.body;

    const vistoriaAtualizada = await prisma.vistoria.update({
      where: { id },
      data: {
        vistoriadorId,
        imovelId,
        data,
      },
    });

    return res.json(vistoriaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar vistoria:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar vistoria" });
  }
};

export const obterVistoriaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("ID da Vistoria:", id);

    const vistoria = await prisma.vistoria.findUnique({
      where: { id },
      include: {
        imovel: {
          include: {
            comodo: {
              include: {
                componente: true,
              },
            },
          },
        },
        vistoriador: true, // Inclui o vistoriador associado à vistoria
      },
    });


    if (!vistoria) {
      return res.status(404).json({ mensagem: "Vistoria não encontrada." });
    }

    return res.json(vistoria);
  } catch (error) {
    console.error("Erro ao buscar vistoria por ID:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar vistoria por ID" });
  }
};


const VistoriaController = {
  criarVistoria,
  obterVistorias,
  atualizarVistoria,
  obterVistoriaPorId,
  pegarVistoriaCompleta,
  obterUltimaVistoria,
};

export default VistoriaController;
