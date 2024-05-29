import {
  PDFDocument,
  PDFFont,
  PDFPage,
  RGB,
  rgb,
  StandardFonts,
} from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
} from "docx";
import prisma from "../../database/prisma";
import { TipoVistoria } from "@prisma/client";

interface DadosVistoria {
  id: string;
  data: Date;
  tipo: TipoVistoria;
  imovel: {
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
        tipo: string;
        estado: string;
        material: string;
        cor: string;
        obs: string;
      }[];
    }[];
  };
  vistoriador: {
    id: string;
    cpf: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    tel: string;
  };
}

enum HttpStatus {
  Sucesso = 200,
  Criado = 201,
  RequisicaoInvalida = 400,
  NaoEncontrado = 404,
  EntidadeNaoProcessavel = 422,
  ErroInternoServidor = 500,
}

let fonte: any;

const gerarIdUnico = (): string => {
  return `Vistoria${uuidv4().substr(0, 4)}`;
};

async function criarHeaderPDF(
  page: any,
  pdfDoc: PDFDocument,
  vistoria: DadosVistoria
) {
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  fonte = regularFont;

  const fontSize = 12;
  const logoWidth = 125; // Ajuste a largura do logotipo conforme necessário
  const logoHeight = 125; // Ajuste a altura do logotipo conforme necessário

  // Leia a imagem do logotipo
  const logoPath = path.join(__dirname, "..", "..", "images", "Sollologo.png");
  const logoImage = await fs.readFile(logoPath);

  // Incorpore a imagem do logotipo no documento PDF
  const logoImageEmbed = await pdfDoc.embedPng(logoImage);

  // Calcule a posição x para centralizar o logotipo na página
  const xPosition = (page.getWidth() - logoWidth) / 2;

  // Calcule a posição y para centralizar o logotipo na parte superior da página
  const yPosition = page.getHeight() - 5 - logoHeight;

  // Desenhe o logotipo na página do PDF
  page.drawImage(logoImageEmbed, {
    x: xPosition,
    y: yPosition,
    width: logoWidth,
    height: logoHeight,
  });

  // Atualize o yOffset para deixar espaço para o logotipo
  const yOffset = yPosition - 0;

  // O restante do seu código existente para o texto do cabeçalho
  const dataFormatada = formatarData(vistoria.data);
  const headerText = `Vistoria de Locação de Imóvel - Residencial\nData: ${dataFormatada} Fotos: 0 Tipo: ${
    vistoria.tipo
  } Vistoriador: ${
    vistoria.vistoriador
      ? `${vistoria.vistoriador.firstName} ${vistoria.vistoriador.middleName}`
      : "*Nome do Vistoriador Indisponível*"
  }\nRua: ${vistoria.imovel.rua} , N° ${vistoria.imovel.numero} , ${
    vistoria.imovel.complemento
  } , ${vistoria.imovel.bairro} , ${vistoria.imovel.cidade}/${
    vistoria.imovel.estado
  } , CEP: ${vistoria.imovel.cep}.`;

  page.drawText(headerText.split("\n")[0], {
    x: 50, // Ajuste a coordenada x conforme necessário
    y: yOffset,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(headerText.substring(headerText.indexOf("\n") + 1), {
    x: 50, // Ajuste a coordenada x conforme necessário
    y: yOffset - 25,
    size: fontSize,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
}

const ordemExportacao = [
  "Sala",
  "Corredor",
  "BanheiroSocial",
  "Banheiro",
  "Quarto",
  "Copa",
  "Cozinha",
  "Servico",
  "BanheiroServico",
  "Dispensa",
  "Sacada",
  "Outro",
];



async function criarPaginaPDF(
  pdfDoc: PDFDocument,
  vistoriaCompleta: DadosVistoria
): Promise<PDFPage> {
  const page = pdfDoc.addPage();

  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  await criarHeaderPDF(page, pdfDoc, vistoriaCompleta);
  await criarBodyPDF(page, pdfDoc, vistoriaCompleta);
  return page;
}

async function exportarVistoriaParaPDF(req: Request, res: Response) {
  const { id } = req.params;

  try {
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
      return res
        .status(HttpStatus.NaoEncontrado)
        .json({ mensagem: "Vistoria não encontrada." });
    }

    const pdfDoc = await PDFDocument.create();
    await criarPaginaPDF(pdfDoc, vistoriaCompleta);

    const pdfBytes = await pdfDoc.save();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "");
    const filename = `vistoria_${id}_${timestamp}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Length", pdfBytes.length);

    res.end(pdfBytes); // Envie o PDF como resposta
  } catch (error) {
    console.error("Erro ao exportar vistoria para PDF:", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ error: "Erro interno ao exportar vistoria para PDF" });
  } finally {
    await prisma.$disconnect();
  }
}

function formatarData(data: Date) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

const VistoriaController = {
  exportarVistoriaParaPDF,
};

export default VistoriaController;
