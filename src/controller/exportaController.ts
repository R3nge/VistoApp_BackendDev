import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../database/prisma";
import { FotoComponente, TipoVistoria } from "@prisma/client";
import fetch from "node-fetch"; // Importe o node-fetch para fazer requisições HTTP

interface DadosVistoria {
  id: string;
  data: Date;
  tipo: string; // Corrigi para o tipo string, ajuste conforme necessário
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
        tipo: string;
        estado: string;
        material: string;
        cor: string;
        obs: string;
        fotos: {
          id: string;
          base64: string; // Ajustado para base64 apenas
          mimetype: string;
        }[];
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
  const logoWidth = 150; // Ajuste a largura do logotipo conforme necessário
  const logoHeight = 150; // Ajuste a altura do logotipo conforme necessário

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
  const yOffset = yPosition - 5;

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
    y: yOffset - 15,
    size: fontSize,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
}

function novaPagina(page: any, yOffset: number, lineHeight: number): boolean {
  const margemInferior = 25; // Ajuste conforme necessário
  return yOffset - lineHeight < margemInferior;
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

function breakTextIntoLines(
  text: string,
  fontSize: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let currentLine = "";
  const words = text.split(/\s+/); // Usar uma expressão regular para dividir o texto por espaços em branco

  for (const word of words) {
    const width = fonte.widthOfTextAtSize(currentLine + " " + word, fontSize);

    if (word.includes("\n")) {
      const subWords = word.split("\n");
      for (const subWord of subWords) {
        if (currentLine !== "") {
          lines.push(currentLine);
          currentLine = "";
        }
        lines.push(subWord);
      }
    } else if (width <= maxWidth) {
      currentLine += (currentLine === "" ? "" : " ") + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine !== "") {
    lines.push(currentLine);
  }

  return lines;
}

async function criarBodyPDF(
  page: any,
  pdfDoc: PDFDocument,
  vistoria: DadosVistoria,
  corTextoCmodo: [number, number, number],
  corTextoComponente: [number, number, number],
  fonteCmodo: any,
  fonteComponente: any
): Promise<void> {
  const fontSize = 12;
  const larguraMaxima = page.getWidth() - 160;

  let yOffset = page.getHeight() - 220;
  const lineHeight = 25;

  for (const comodo of vistoria.imovel.comodo) {
    let comodoText = `${comodo.numero}. ${comodo.tipo}`;

    const tiposComponentes: string[] = [];

    if (comodo.componente && comodo.componente.length > 0) {
      let componentesText = "";
      for (const componente of comodo.componente) {
        const tipoText = `${componente.tipo}`;

        if (!tiposComponentes.includes(tipoText)) {
          tiposComponentes.push(tipoText);
        }

        const componenteText = ` ${tipoText}: ${componente.material}, ${componente.cor} , ${componente.estado} `;

        componentesText += componenteText;

        if (componente.obs) {
          componentesText += ` OBS: ${componente.obs}`;
        }
      }

      comodoText += ` ${tiposComponentes.join(", ")}`;

      const fullText = `${comodoText} ${componentesText}`;

      const textLines = breakTextIntoLines(fullText, fontSize, larguraMaxima);
      const textHeight = textLines.length * lineHeight;
      if (yOffset - textHeight < 50) {
        page = pdfDoc.addPage();
        yOffset = page.getHeight() - 50;
      }

      for (const line of textLines) {
        const isBold = tiposComponentes.some((tipo) => line.includes(tipo));
        page.drawText(line, {
          x: 50,
          y: yOffset,
          size: fontSize,
          font: isBold ? fonteCmodo : fonteComponente,
          color: isBold
            ? rgb(corTextoCmodo[0], corTextoCmodo[1], corTextoCmodo[2])
            : rgb(
                corTextoComponente[0],
                corTextoComponente[1],
                corTextoComponente[2]
              ),
        });
        yOffset -= lineHeight;
      }
    }

    // Adicionar fotos dos componentes
    if (comodo.componente) {
      for (const componente of comodo.componente) {
        if (componente.fotos && componente.fotos.length > 0) {
          for (const foto of componente.fotos) {
            try {
              const fotoBytes = await fetch(foto.base64).then(
                (res: { arrayBuffer: () => any }) => res.arrayBuffer()
              );
              const fotoEmbed = await pdfDoc.embedPng(fotoBytes);
              const fotoWidth = 100; // Ajuste conforme necessário
              const fotoHeight = 100; // Ajuste conforme necessário
              page.drawImage(fotoEmbed, {
                x: 400,
                y: yOffset,
                width: fotoWidth,
                height: fotoHeight,
              });
              yOffset -= fotoHeight + 10; // Espaço entre as fotos
            } catch (error) {
              console.error(`Erro ao carregar imagem para componente`, error);
            }
          }
        }
      }
    }
  }
}

const corTextoCmodo: [number, number, number] = [0, 0, 0]; // Cor RGB para o texto do cômodo (por exemplo, azul)
const corTextoComponente: [number, number, number] = [0, 0, 0]; // Cor RGB para o texto do componente (por exemplo, vermelho)
let fonteCmodo: any; // Fonte para o texto do cômodo
let fonteComponente: any; // Fonte para o texto do componente

async function criarPaginaPDF(
  pdfDoc: PDFDocument,
  vistoriaCompleta: any // Altere para o tipo real esperado
): Promise<any> {
  const page = pdfDoc.addPage();

  await criarHeaderPDF(page, pdfDoc, vistoriaCompleta);
  await criarBodyPDF(
    page,
    pdfDoc,
    vistoriaCompleta,
    corTextoCmodo,
    corTextoComponente,
    fonteCmodo,
    fonteComponente
  );

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
                componente: {
                  include: {
                    fotos: true, // Inclui as fotos dos componentes
                  },
                },
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

async function salvarPDF(filePath: string, pdfDoc: PDFDocument) {
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(filePath, pdfBytes);
}

const VistoriaController = {
  exportarVistoriaParaPDF,
};

export default VistoriaController;
