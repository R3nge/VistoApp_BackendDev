import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { ZodError } from "zod";

const HttpStatus = {
  Success: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  UnprocessableEntity: 422,
  InternalServerError: 500,
};

export const criarItemPrincipal = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const itemPrincipal = await prisma.itemPrincipal.create({
      data: {
        name,
      },
    });

    return res.status(HttpStatus.Created).json(itemPrincipal);
  } catch (error) {
    console.error("Erro ao criar Item Principal", error);

    if (error instanceof ZodError) {
      console.error("Erros de validação:", error.errors);
      return res.status(HttpStatus.UnprocessableEntity).json({
        mensagem: "Por favor, corrija os seguintes erros:",
        errors: error.errors,
      });
    }

    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const criarItemAcessorio = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const itemAcessorio = await prisma.itemAcessorio.create({
      data: {
        name,
      },
    });

    return res.status(HttpStatus.Created).json(itemAcessorio);
  } catch (error) {
    console.error("Erro ao criar Item Acessório", error);

    if (error instanceof ZodError) {
      console.error("Erros de validação:", error.errors);
      return res.status(HttpStatus.UnprocessableEntity).json({
        mensagem: "Por favor, corrija os seguintes erros:",
        errors: error.errors,
      });
    }

    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const buscarItemPrincipal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const itemPrincipal = await prisma.itemPrincipal.findUnique({
      where: {
        id,
      },
    });

    if (!itemPrincipal) {
      return res.status(HttpStatus.NotFound).json({
        mensagem: "Item Principal não encontrado",
      });
    }

    return res.status(HttpStatus.Success).json(itemPrincipal);
  } catch (error) {
    console.error("Erro ao buscar Item Principal", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const buscarItemAcessorio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const itemAcessorio = await prisma.itemAcessorio.findUnique({
      where: {
        id,
      },
    });

    if (!itemAcessorio) {
      return res.status(HttpStatus.NotFound).json({
        mensagem: "Item Acessório não encontrado",
      });
    }

    return res.status(HttpStatus.Success).json(itemAcessorio);
  } catch (error) {
    console.error("Erro ao buscar Item Acessório", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const excluirItemPrincipal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.itemPrincipal.delete({
      where: {
        id,
      },
    });

    return res.status(HttpStatus.Success).json({
      mensagem: "Item Principal excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir Item Principal", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const excluirItemAcessorio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.itemAcessorio.delete({
      where: {
        id,
      },
    });

    return res.status(HttpStatus.Success).json({
      mensagem: "Item Acessório excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir Item Acessório", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

const ItemController = {
  criarItemPrincipal,
  criarItemAcessorio,
  buscarItemPrincipal,
  buscarItemAcessorio,
  excluirItemPrincipal,
  excluirItemAcessorio,
};

export default ItemController;
