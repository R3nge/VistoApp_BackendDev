import { Request, Response } from "express";
import prisma from "../../database/prisma";

const HttpStatus = {
  Success: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  UnprocessableEntity: 422,
  InternalServerError: 500,
};

const gerarNumeroAleatorio = (): number => {
  // Gera um número aleatório entre 1 e 10000
  return Math.floor(Math.random() * 10000) + 1;
};

export const criarEndereco = async (req: Request, res: Response) => {
  try {
    const { rua, complemento, numero, bairro, cidade, estado, cep } = req.body;

    if (
      !rua ||
      !complemento ||
      !numero ||
      !bairro ||
      !cidade ||
      !estado ||
      !cep
    ) {
      return res.status(422).json({
        mensagem: "Para cadastrar um Endereço preencha todos os campos!",
      });
    } else {
      const gerarIdUnico = async (): Promise<string> => {
        const id = `Endereco${gerarNumeroAleatorio()}`;
        const enderecoExistente = await prisma.enderecoPessoa.findUnique({
          where: {
            id,
          },
        });

        if (enderecoExistente !== null) {
          // Se o ID já existe, chama recursivamente a função para gerar um novo
          return gerarIdUnico();
        } else {
          return id;
        }
      };

      const id = await gerarIdUnico();

      const endereco = await prisma.enderecoPessoa.create({
        data: {
          id,
          rua,
          complemento,
          numero,
          bairro,
          cidade,
          estado,
          cep,
        },
      });

      res.json(endereco);
    }
  } catch (error) {
    console.error("Erro ao criar endereço:", error);
    res.status(500).json({ error: "Erro interno ao criar endereço" });
  }
};

export const pegarEnderecos = async (req: Request, res: Response) => {
  try {
    console.log("Buscando endereços...");

    const enderecos = await prisma.enderecoPessoa.findMany();

    console.log("Endereços encontrados:", enderecos);

    res.json(enderecos);
  } catch (error) {
    console.error("Erro ao buscar endereços:", error);
    res.status(500).json({ error: "Erro interno ao buscar endereços" });
  }
};

export const pegarEnderecoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensagem: "ID não fornecido" });
    }

    const endereco = await prisma.enderecoPessoa.findUnique({
      where: {
        id: String(id), // Garante que o id seja uma string
      },
    });

    if (!endereco) {
      return res.status(404).json({ mensagem: "Endereço não encontrado" });
    }

    res.json(endereco);
  } catch (error) {
    console.error("Erro ao buscar endereço por ID:", error);
    res.status(500).json({ error: "Erro interno ao buscar endereço por ID" });
  }
};

export const pegarEnderecoPorRua = async (req: Request, res: Response) => {
  try {
    const { rua } = req.params;

    const enderecos = await prisma.enderecoPessoa.findMany({
      where: {
        rua,
      },
    });

    res.json(enderecos);
  } catch (error) {
    console.error("Erro ao buscar endereços por rua:", error);
    res.status(500).json({ error: "Erro interno ao buscar endereços por rua" });
  }
};
export const pegarEnderecosPorCidade = async (req: Request, res: Response) => {
  try {
    const { cidade } = req.params;

    const enderecos = await prisma.enderecoPessoa.findMany({
      where: {
        cidade,
      },
    });

    res.json(enderecos);
  } catch (error) {
    console.error("Erro ao buscar endereços por cidade:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao buscar endereços por cidade" });
  }
};

export const pegarEnderecosPorCep = async (req: Request, res: Response) => {
  try {
    const { cep } = req.params;

    const enderecos = await prisma.enderecoPessoa.findMany({
      where: {
        cep,
      },
    });

    res.json(enderecos);
  } catch (error) {
    console.error("Erro ao buscar endereços por CEP:", error);
    res.status(500).json({ error: "Erro interno ao buscar endereços por CEP" });
  }
};

const EnderecoPessoaController = {
  criarEndereco,
  pegarEnderecos,
  pegarEnderecoPorId,
  pegarEnderecoPorRua,
  pegarEnderecosPorCidade,
  pegarEnderecosPorCep,
};

export default EnderecoPessoaController;
