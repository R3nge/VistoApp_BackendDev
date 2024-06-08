import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { $Enums } from "@prisma/client";
import { Readable } from "stream";

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const credentials = require("./credentials.json");

// // AUTORIZAÇÃO PARA AMBIENTE TESTE LOCALHGOST
// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: "https://www.googleapis.com/auth/drive",
// });

//PARA PRODUÇÃO

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  },
  scopes: "https://www.googleapis.com/auth/drive",
});

// Crie um cliente OAuth2
const drive = google.drive({ version: "v3", auth });

// ID da pasta "Componentes" no Google Drive
const componentesFolderId = "1kgSXmtimzHp_U_l9ngffNG4Hyyptj09F";

// Função para fazer upload de um arquivo para o Google Drive e retornar a URL
async function uploadFile(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const fileMetadata = {
    name: fileName,
    parents: [componentesFolderId], // Adicione esta linha
  };
  // Convert Buffer to Readable Stream
  const readableStream = new Readable();
  readableStream.push(fileBuffer);
  readableStream.push(null);

  const media = {
    mimeType: "image/jpeg", // Mime type do seu arquivo
    body: readableStream,
  };

  try {
    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    // Adicione este bloco de código após a criação do arquivo
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    console.log("File uploaded with ID:", res.data.id);

    // Retorna a URL do arquivo carregado
    return `https://drive.google.com/uc?id=${res.data.id}`;
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
}

// Função para upload de fotos do componente para o Google Drive
export const uploadFotoComponente = async (req: any, res: any) => {
  console.log("Iniciando upload de fotos...");
  try {
    const { componenteId } = req.params;
    console.log(`ID do Componente: ${componenteId}`);

    if (!req.files || !Array.isArray(req.files)) {
      console.error("Nenhum arquivo foi enviado.");
      return res.status(400).send("No files were uploaded.");
    }

    const files = req.files as Express.Multer.File[];
    console.log(`Número de arquivos recebidos: ${files.length}`);

    try {
      const fileUrls: string[] = []; // Inicializa a variável fileUrls como um array vazio

      for (const file of files) {
        const uniqueName = `${uuidv4()}-${file.originalname}`;

        // Faz o upload do arquivo para o Google Drive e obtém a URL
        const url = await uploadFile(file.buffer, uniqueName);

        // Adiciona a URL do arquivo ao array fileUrls
        fileUrls.push(url);
      }

      // Atualize o registro do componente com as URLs das fotos
      const componente = await prisma.componente.update({
        where: { id: componenteId },
        data: {
          fotos: fileUrls.join(","), // Salva as URLs das fotos como string separada por vírgula
        },
      });

      console.log("Atualização do componente concluída:", componente);
      res
        .status(200)
        .json({ componente, message: "Files uploaded successfully." });
    } catch (error) {
      console.error("Erro durante o processamento dos arquivos:", error);
      res.status(500).send("Internal Server Error");
    }
  } catch (disconnectError) {
    console.error("Erro ao desconectar do banco de dados:", disconnectError);
    res.status(500).send("Internal Server Error");
  }
};

dotenv.config();

const HttpStatus = {
  Success: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  UnprocessableEntity: 422,
  InternalServerError: 500,
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
};

export default ComponenteController;
