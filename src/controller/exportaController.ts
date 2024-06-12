import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
  corTextoCmodo: [number, number, number], // Cor RGB para o texto do cômodo
  corTextoComponente: [number, number, number], // Cor RGB para o texto do componente
  fonteCmodo: any, // Fonte para o texto do cômodo
  fonteComponente: any // Fonte para o texto do componente
): Promise<void> {
  const fontSize = 12;
  const larguraMaxima = page.getWidth() - 160; // Ajuste conforme necessário

  let yOffset = page.getHeight() - 220;
  const lineHeight = 25;

  for (const comodo of vistoria.imovel.comodo) {
    let comodoText = `${comodo.numero}. ${comodo.tipo}`;

    // Array para armazenar os tipos de componentes
    const tiposComponentes: string[] = [];

    if (comodo.componente && comodo.componente.length > 0) {
      let componentesText = "";
      for (const componente of comodo.componente) {
        const tipoText = `${componente.tipo}`;

        // Adiciona o tipo do componente ao array
        if (!tiposComponentes.includes(tipoText)) {
          tiposComponentes.push(tipoText);
        }

        const componenteText = ` ${tipoText}: ${componente.material}, ${componente.cor} , ${componente.estado} `;

        // Concatena o texto do componente na mesma linha
        componentesText += componenteText;

        if (componente.obs) {
          // Adiciona a observação na mesma linha
          componentesText += ` OBS: ${componente.obs}`;
        }
      }

      // Adiciona os tipos de componentes ao texto do cômodo
      comodoText += ` ${tiposComponentes.join(", ")}`;

      // Adiciona o texto do cômodo e dos componentes em uma única linha
      const fullText = `${comodoText} ${componentesText}`;

      // Verifica se há espaço suficiente na página atual
      const textLines = breakTextIntoLines(fullText, fontSize, larguraMaxima);
      const textHeight = textLines.length * lineHeight;
      if (yOffset - textHeight < 50) {
        // 50 é uma margem de segurança
        // Cria uma nova página
        page = pdfDoc.addPage();
        yOffset = page.getHeight() - 50; // 50 é uma margem de segurança
      }

      // Adiciona o texto à página
      for (const line of textLines) {
        // Verifica se é o texto do cômodo ou dos componentes para aplicar as cores e fontes adequadas
        if (line.includes(comodo.tipo)) {
          page.drawText(line, {
            x: 50,
            y: yOffset,
            size: fontSize,
            font: fonteCmodo, // Usa a fonte do cômodo
            color: rgb(corTextoCmodo[1], corTextoCmodo[1], corTextoCmodo[2]), // Usa a cor do cômodo
          });
        } else {
          page.drawText(line, {
            x: 50,
            y: yOffset,
            size: fontSize,
            font: fonteComponente, // Usa a fonte do componente
            color: rgb(
              corTextoComponente[0],
              corTextoComponente[1],
              corTextoComponente[2]
            ), // Usa a cor do componente
          });
        }
        yOffset -= lineHeight;
      }
    } else {
      comodoText += ` Sem componentes registrados. `;
      page.drawText(comodoText, {
        x: 50,
        y: yOffset,
        size: fontSize,
        font: fonteCmodo, // Usa a fonte do cômodo
        color: rgb(corTextoCmodo[0], corTextoCmodo[1], corTextoCmodo[2]), // Usa a cor do cômodo
      });
      yOffset -= lineHeight;
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

async function exportarVistoriaParaDOCX(req: Request, res: Response) {
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

    const docBuffer = await criarDocumentoDOCX(vistoriaCompleta);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "");
    const filename = `vistoria_${id}_${timestamp}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Length", docBuffer.length);

    res.end(docBuffer); // Envie o conteúdo do arquivo DOCX como resposta
  } catch (error) {
    console.error("Erro ao exportar vistoria para DOCX:", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ error: "Erro interno ao exportar vistoria para DOCX" });
  } finally {
    await prisma.$disconnect();
  }
}

////
async function criarDocumentoDOCX(vistoria: DadosVistoria) {
  console.log("Iniciando criação do documento DOCX...");

  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Inserir imagem
            new Paragraph({
              children: [
                new ImageRun({
                  data: await fs.readFile(
                    path.join(__dirname, "..", "..", "images", "Sollologo.png")
                  ),
                  transformation: {
                    width: 150, // Ajuste a largura conforme necessário
                    height: 150, // Ajuste a altura conforme necessário
                  },
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Vistoria de Locação de Imóvel - Residencial`,
                  bold: true,
                  size: 30,
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Data: ${formatarData(
                    vistoria.data
                  )} Fotos: 0 Vistoriador: ${vistoria.vistoriador.firstName} ${
                    vistoria.vistoriador.middleName
                  }`,
                  size: 25,
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Rua: ${vistoria.imovel.rua} , N° ${vistoria.imovel.numero} , ${vistoria.imovel.complemento} , ${vistoria.imovel.bairro} , ${vistoria.imovel.cidade}/${vistoria.imovel.estado} , CEP: ${vistoria.imovel.cep}.`,
                  size: 25,
                  bold: true,
                }),
              ],
              alignment: "center",
            }),
            ...(vistoria.imovel.comodo || []).map((comodo) => {
              const comodoText = `${comodo.numero}. ${comodo.tipo}`;
              const componentesText =
                (comodo.componente || []).length > 0
                  ? comodo.componente
                      .map(
                        (componente) =>
                          `${componente.tipo}: ${componente.material}, ${
                            componente.cor
                          }, ${componente.estado}${
                            componente.obs ? ` OBS:${componente.obs}` : ""
                          }`
                      )
                      .join("; ")
                  : "Sem componentes registrados.";
              return new Paragraph({
                children: [
                  new TextRun({
                    text: `${comodoText} ${componentesText}`,
                    size: 30,
                  }),
                ],
              });
            }),
          ],
        },
      ],
      title: `Vistoria${vistoria.id}`,
    });

    const buffer = await Packer.toBuffer(doc);

    console.log("Documento DOCX criado com sucesso.");
    return buffer;
  } catch (error) {
    console.error("Erro ao criar documento DOCX:", error);
    throw error;
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

async function salvarDOCX(filePath: string, buffer: Buffer) {
  try {
    await fs.writeFile(filePath, buffer);
    console.log("DOCX salvo com sucesso em:", filePath);
  } catch (error) {
    console.error("Erro ao salvar DOCX:", error);
    throw error;
  }
}

const VistoriaController = {
  exportarVistoriaParaPDF,
  exportarVistoriaParaDOCX,
};

export default VistoriaController;
