import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { Readable } from "stream";

const { google } = require("googleapis");

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Verifique se todas as variáveis de ambiente necessárias estão definidas
const requiredEnvVars = [
  "TYPE",
  "PROJECT_ID",
  "PRIVATE_KEY_ID",
  "PRIVATE_KEY",
  "CLIENT_EMAIL",
  "CLIENT_ID",
  "AUTH_URI",
  "TOKEN_URI",
  "AUTH_PROVIDER_X509_CERT_URL",
  "CLIENT_X509_CERT_URL",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Falta a variável de ambiente necessária: ${envVar}`);
  }
});

// Defina a autenticação condicionalmente
let auth;
auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.TYPE!,
    project_id: process.env.PROJECT_ID!,
    private_key_id: process.env.PRIVATE_KEY_ID!,
    private_key: process.env.PRIVATE_KEY!.replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL!,
    client_id: process.env.CLIENT_ID!,
    auth_uri: process.env.AUTH_URI!,
    token_uri: process.env.TOKEN_URI!,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL!,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL!,
  },
  scopes: "https://www.googleapis.com/auth/drive",
});

// Crie um cliente OAuth2
const drive = google.drive({ version: "v3", auth });

// ID da pasta "Componentes" no Google Drive
const componentesFolderId = "1kgSXmtimzHp_U_l9ngffNG4Hyyptj09F";

// Função para verificar se a pasta do componente já existe, e criar se não existir
async function getOrCreateComponentFolder(
  componentName: string
): Promise<string> {
  const folderMetadata = {
    name: componentName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [componentesFolderId],
  };

  try {
    // Verificar se a pasta já existe
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${componentName}' and '${componentesFolderId}' in parents and trashed=false`,
      fields: "files(id, name)",
    });

    if (res.data.files && res.data.files.length > 0) {
      // Retorna o ID da pasta existente
      return res.data.files[0].id!;
    } else {
      // Cria uma nova pasta
      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });
      return folder.data.id!;
    }
  } catch (error) {
    console.error("Erro ao verificar ou criar a pasta do componente:", error);
    throw error;
  }
}

// Função para fazer upload de um arquivo para o Google Drive e retornar a URL
async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  parentFolderId: string
): Promise<string> {
  const fileMetadata = {
    name: fileName,
    parents: [parentFolderId],
  };

  // Converta o Buffer para um Readable Stream
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

    console.log("Arquivo carregado com ID:", res.data.id);

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
    const { componenteId, tipo } = req.params;
    const { vistoriaId, nome } = req.body; // Certifique-se de passar vistoriaId e nome no corpo da solicitação

    console.log(`ID do Componente: ${componenteId}`);
    console.log(`Nome do Componente: ${tipo}`);

    if (!req.files || !Array.isArray(req.files)) {
      console.error("Nenhum arquivo foi enviado.");
      return res.status(400).send("Nenhum arquivo foi enviado.");
    }

    const files = req.files as Express.Multer.File[];
    console.log(`Número de arquivos recebidos: ${files.length}`);

    try {
      // Obtém ou cria a pasta do componente
      const componentFolderId = await getOrCreateComponentFolder(tipo);

      const fileUrls: string[] = []; // Inicializa a variável fileUrls como um array vazio

      for (const file of files) {
        const uniqueName = `${componenteId}-${vistoriaId}-${nome}-${Date.now()}-${
          file.originalname
        }`; // Nome completo da foto

        // Faz o upload do arquivo para o Google Drive e obtém a URL
        const url = await uploadFile(
          file.buffer,
          uniqueName,
          componentFolderId
        );

        // Adiciona a URL do arquivo ao array fileUrls
        fileUrls.push(url);
      }

      // Cria registros para as novas fotos no banco de dados
      const fotoRecords = fileUrls.map((url) => ({
        id: uuidv4(),
        url,
        componenteId,
      }));

      // Atualize o registro do componente com as novas fotos
      const componente = await prisma.componente.update({
        where: { id: componenteId },
        data: {
          fotos: {
            create: fotoRecords,
          },
        },
        include: {
          fotos: true, // Inclua as fotos na resposta para verificar a atualização
        },
      });

      console.log("Atualização do componente concluída:", componente);
      res
        .status(200)
        .json({ componente, message: "Arquivos carregados com sucesso." });
    } catch (error) {
      console.error("Erro durante o processamento dos arquivos:", error);
      res.status(500).send("Erro interno do servidor.");
    }
  } catch (disconnectError) {
    console.error("Erro ao desconectar do banco de dados:", disconnectError);
    res.status(500).send("Erro interno do servidor.");
  }
};

const getFotosComponente = async (req: Request, res: Response) => {
  const componenteId = req.params.componenteId;

  try {
    // Busca o componente pelo ID junto com suas fotos associadas
    const componente = await prisma.componente.findUnique({
      where: { id: componenteId },
      include: {
        fotos: true, // Inclui todas as fotos associadas ao componente
      },
    });

    if (!componente) {
      return res.status(404).json({ message: "Componente não encontrado." });
    }

    // Extrai as URLs das fotos do componente
    const fotoUrls = componente.fotos.map((foto) => foto.url);

    res.status(200).json({ fotos: fotoUrls });
  } catch (error) {
    console.error("Erro ao obter fotos do componente:", error);
    res.status(500).send("Erro interno do servidor.");
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
  getFotosComponente,
};

export default ComponenteController;
