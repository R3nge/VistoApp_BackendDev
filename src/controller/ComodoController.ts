import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid"; // Importa a função v4 do pacote uuid
import {
  Componente,
  Cor,
  Estado,
  Material,
  Prisma,
  TipoComodo,
} from "@prisma/client";

const HttpStatus = {
  Success: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  UnprocessableEntity: 422,
  InternalServerError: 500,
};
const gerarIdUnicocomp = async (prefixo: string): Promise<string> => {
  const id = `${prefixo}${uuidv4().substr(0, 10)}`; // Use os primeiros 4 caracteres do UUID
  const componenteExistente = await prisma.componente.findUnique({
    where: {
      id,
    },
  });

  if (componenteExistente !== null) {
    return gerarIdUnicocomp(prefixo);
  } else {
    return id;
  }
};

export const buscarUltimosComodosComComponentes = async (
  req: Request,
  res: Response
) => {
  try {
    const { quantidade = 5 } = req.query; // Permitir que a quantidade de comodos seja personalizada

    const quantidadeComodos =
      typeof quantidade === "string" ? parseInt(quantidade, 10) : 5;

    if (isNaN(quantidadeComodos) || quantidadeComodos <= 0) {
      return res
        .status(400)
        .json({ mensagem: "Quantidade inválida de comodos." });
    }

    const ultimosComodos = await prisma.comodo.findMany({
      take: 5,
      include: {
        componente: true,
      },
    });

    if (!ultimosComodos || ultimosComodos.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Nenhum comodo encontrado recentemente." });
    }

    return res.json(ultimosComodos);
  } catch (error) {
    console.error("Erro ao buscar os últimos comodos:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar os últimos comodos." });
  } finally {
    await prisma.$disconnect(); // Desconectar o Prisma após a execução da função
  }
};
// Função para gerar um ID único para o Comodo
const gerarIdUnico = async (prefixo: string): Promise<string> => {
  const id = `${prefixo}${uuidv4().substr(0, 100)}`; // Use os primeiros 4 caracteres do UUID

  // Verificar se o ID já existe no banco de dados
  const comodoExistente = await prisma.comodo.findUnique({
    where: { id },
  });

  if (comodoExistente) {
    throw new Error("ID gerado não é único.");
  }

  return id;
};

type ComponenteWithoutId = Omit<Componente, "id">;

export const criarComodoComComponentes = async (
  req: Request<
    { imovelId: string; vistoriaId: string },
    any,
    { tipo: TipoComodo }
  >,
  res: Response<{
    comodo: {
      id: string;
      imovelId: string;
      tipo: TipoComodo;
      numero: number;
      componentes: Componente[];
    };
  }>
) => {
  const { tipo } = req.body;
  const { imovelId, vistoriaId } = req.params;

  try {
    // Encontrar todos os cômodos existentes para este imóvel
    const comodosExistem = await prisma.comodo.findMany({
      where: { imovelId },
      select: { numero: true },
    });

    const maxNumeroComodo =
      Math.max(...comodosExistem.map((comodo) => comodo.numero), 0) + 1;

    const novoComodo = await prisma.comodo.create({
      data: {
        id: uuidv4(),
        imovelId,
        tipo,
        numero: maxNumeroComodo,
      },
    });

    const componentesPreCadastrados = await adicionarComponentesPreCadastrados(
      novoComodo.id,
      tipo,
      vistoriaId
    );

    res.status(201).json({
      comodo: {
        id: novoComodo.id,
        imovelId: novoComodo.imovelId,
        tipo: novoComodo.tipo,
        numero: novoComodo.numero,
        componentes: componentesPreCadastrados,
      },
    });
  } catch (error) {
    console.error("Erro ao criar o Comodo com Componentes:", error);
    // res.status(500).json({ mensagem: "Erro ao criar o Comodo." });
  }
};
// Função para adicionar componentes pré-cadastrados a um comodo
const adicionarComponentesPreCadastrados = async (
  comodoId: string,
  tipo: TipoComodo,
  vistoriaId: string
): Promise<Componente[]> => {
  let componentes: Componente[] = [];

  // Lógica para determinar quais componentes pré-cadastrados devem ser adicionados com base no tipo de comodo
  switch (tipo) {
    case "Cozinha":
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Teto",
          "N/a",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Parede",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Base",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Porta",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Janela",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Tomadas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Pia",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      break;
    ///8888888888888888888888 QUARTO ************************////

    case "Quarto":
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Parede",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Teto",
          "N/a",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Base",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Portas e Portais",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Maçanetas e Fechaduras",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );

      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Janelas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Interruptores e Tomadas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Piso",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Rodapé",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Obs",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      break;

    ///8888888888888888888888 Banheiro ************************////

    case "Banheiro":
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Parede",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Teto",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Base",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Portas e Portais",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Maçanetas e Fechaduras",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Janelas",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Piso",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Pia",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Torneira",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Armário",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Vaso Sanitário",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Descarga",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Acessórios",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Obs",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );

      break;
    /////////// 8888888888888888888888 Sala //////////////////
    case "Sala":
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Parede",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Teto",
          "N/a",
          "Branco",
          "NP",
          "Tinta"
        )
      );

      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Base",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );

      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Portas e Portais",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Maçanetas e Fechaduras",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Janelas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Interruptores e Tomadas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Piso",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Rodapé",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Obs",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      break;
    /////////// 8888888888888888888888 Corredor //////////////////
    case "Corredor":
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Parede",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Teto",
          "N/a",
          "Branco",
          "NP",
          "Tinta"
        )
      );

      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Base",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );

      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Portas e Portais",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Maçanetas e Fechaduras",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Janelas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Interruptores e Tomadas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Piso",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Rodapé",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Obs",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      break;
    /////////// 8888888888888888888888 BanheiroSocial //////////////////

    case "BanheiroSocial":
    case "Banheiro":
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Parede",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Teto",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Base",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Portas e Portais",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Maçanetas e Fechaduras",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Janelas",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Piso",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Pia",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Torneira",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Armário",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Vaso Sanitário",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Descarga",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Acessórios",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Obs",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );

      break;
    /////////// 8888888888888888888888 Copa //////////////////
    case "Copa":
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Teto",
          "N/a",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Parede",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Base",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Rodapé",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Porta",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Janela",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Tomadas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Pia",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      break;
    /////////// 8888888888888888888888 Dispensa //////////////////

    /////////// 8888888888888888888888     Sacada
    case "Sacada":
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Parede",
          "N/A",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Teto",
          "N/a",
          "Branco",
          "NP",
          "Tinta"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Base",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Portas e Portais",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Maçanetas e Fechaduras",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );

      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Janelas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Interruptores e Tomadas",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Piso",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Rodapé",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      componentes.push(
        await adicionarComponente(
          comodoId,
          vistoriaId,
          "Obs",
          "N/A",
          "Branco",
          "NP",
          "Outro"
        )
      );
      break;
    // Adicione mais casos para outros tipos de comodo conforme necessário
    default:
      break;
  }

  return componentes;
};
// Função auxiliar para adicionar um componente específico a um comodo
const adicionarComponente = async (
  comodoId: string,
  vistoriaId: string,
  tipo: string,
  obs: string,
  cor: Cor,
  estado: Estado,
  material: Material
): Promise<Componente> => {
  const novoComponente = await prisma.componente.create({
    data: {
      tipo,
      obs,
      cor,
      estado,
      material,
      comodo: { connect: { id: comodoId } }, // Conectando o componente ao comodo correto
      vistoria: { connect: { id: vistoriaId } }, // Conectando o componente à vistoria correta
    },
  });

  return novoComponente;
};

export const criarComodo = async (
  req: Request<{ imovelId: string }, any, { tipo: TipoComodo }>,
  res: Response<{
    comodo: { id: string; imovelId: string; tipo: TipoComodo; numero: number };
  }>
) => {
  const { tipo } = req.body;
  const { imovelId } = req.params;

  try {
    const ultimoComodo = await prisma.comodo.findFirst({
      where: { imovelId, tipo },
      orderBy: { numero: "desc" },
    });

    let numero = 1;
    if (ultimoComodo) {
      numero = ultimoComodo.numero + 1;
    }

    // Gerar um ID único para o comodo
    const comodoId = uuidv4();

    // Criar o novo Comodo
    const comodo = await prisma.comodo.create({
      data: {
        id: comodoId,
        imovelId,
        tipo: tipo as TipoComodo,
        numero,
      },
    });

    return res.status(HttpStatus.Created).json({
      comodo: {
        id: comodo.id,
        imovelId: comodo.imovelId,
        tipo: comodo.tipo,
        numero: comodo.numero,
      },
    });
  } catch (error) {
    console.error("Erro ao criar o Comodo:", error);
    // return res.status(HttpStatus.InternalServerError).json({ error: "Erro interno ao criar o Comodo" });
  }
};

export const obterUltimoComodo = async (req: Request, res: Response) => {
  try {
    const ultimoComodo = await prisma.comodo.findFirst({
      orderBy: {
        numero: "desc", // Ordena pelo número do comodo em ordem decrescente para obter o último comodo
      },
    });

    if (!ultimoComodo) {
      return res
        .status(404)
        .json({ mensagem: "Nenhum comodo encontrado para este imóvel." });
    }

    return res.json(ultimoComodo);
  } catch (error) {
    console.error("Erro ao obter o último comodo:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao obter o último comodo" });
  }
};

export const pegarComodos = async (req: Request, res: Response) => {
  const { imovelId } = req.params;

  try {
    const comodo = await prisma.comodo.findUnique({
      where: { id: imovelId },
      include: {
        componente: true,
      },
    });

    if (!comodo) {
      return res.status(404).json({ mensagem: "Comodo não encontrado." });
    }

    return res.json(comodo);
  } catch (error) {
    console.error("Erro ao buscar comodo por ID:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar comodo por ID" });
  }
};

export const pegarComodosPorImovel = async (req: Request, res: Response) => {
  const { imovelId } = req.params;

  try {
    const comodos = await prisma.comodo.findMany({
      where: { imovelId },
      include: {
        componente: true,
      },
    });

    if (!comodos || comodos.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Nenhum comodo encontrado para este imóvel." });
    }

    return res.json(comodos);
  } catch (error) {
    console.error("Erro ao buscar comodos por imóvel:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar comodos por imóvel" });
  }
};

export const atualizarComodo = async (req: Request, res: Response) => {
  const { imovelId, comodoId } = req.params;
  const { tipo } = req.body;

  try {
    // Verifica se o cômodo pertence ao imóvel fornecido
    const comodo = await prisma.comodo.update({
      where: { id: comodoId, imovelId: imovelId },
      data: { tipo }, // Aqui você pode adicionar mais campos para atualizar conforme necessário
    });

    return res.json({ mensagem: "Comodo atualizado com sucesso.", comodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao atualizar o Comodo." });
  }
};

export const excluirComodo = async (req: Request, res: Response) => {
  const { comodoId } = req.params;

  try {
    // Encontre todos os componentes associados ao cômodo
    const componentes = await prisma.componente.findMany({
      where: { comodoId: comodoId },
    });

    // Exclua todos os componentes associados ao cômodo
    await Promise.all(
      componentes.map(async (componente) => {
        await prisma.componente.delete({
          where: { id: componente.id },
        });
      })
    );

    // Agora que todos os componentes foram excluídos, exclua o cômodo
    await prisma.comodo.delete({
      where: { id: comodoId },
    });

    return res.json({
      mensagem: "Cômodo e componentes excluídos com sucesso.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ mensagem: "Erro ao excluir o cômodo e componentes." });
  }
};

const ComodoController = {
  criarComodo,
  pegarComodos,
  excluirComodo,
  obterUltimoComodo,
  atualizarComodo,
  criarComodoComComponentes,
  buscarUltimosComodosComComponentes,
  pegarComodosPorImovel,
};

export default ComodoController;
