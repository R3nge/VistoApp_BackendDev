import { Request, Response } from "express";
import prisma from "../../database/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { ZodError } from "zod";
import { RolePessoa } from "@prisma/client";
import { parse } from "date-fns";
import bcrypt from "bcrypt";

// Enum para Códigos de Status HTTP
const HttpStatus = {
  Sucesso: 200,
  Criado: 201,
  RequisicaoInvalida: 400,
  NaoEncontrado: 404,
  EntidadeNaoProcessavel: 422,
  ErroInternoServidor: 500,
};

// Definição da interface EnderecoPessoa
interface EnderecoPessoa {
  id: string;
  rua: string;
  complemento: string;
  numero: number;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

// Definição da interface Pessoa
interface Pessoa {
  id: string;
  cpf: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email?: string | null;  // email é opcional e pode ser nulo
  password?: string | null;  // password é opcional e pode ser nulo
  tel: string;
  endereco: EnderecoPessoa;
  enderecoId: string;
  type: RolePessoa;
  birthDate: Date;
  fotos?: string | null;  // fotos é opcional e pode ser nulo
}


// Função para gerar um número aleatório
function gerarNumeroAleatorio(): number {
  return Math.floor(Math.random() * 10000) + 1;
}

// Função para formatar a data
function formatarData(dataString: string): Date {
  const [dia, mes, ano] = dataString.split("/").map(Number);
  const dataFormatada = new Date(ano, mes - 1, dia);
  return dataFormatada;
}

// Função para formatar o número de telefone
function formatarTelefone(telefone: string) {
  const telefoneStr = telefone.toString();
  const ddd = telefoneStr.slice(0, 2);
  const parte1 = telefoneStr.slice(2, 7);
  const parte2 = telefoneStr.slice(7);

  const numeroFormatado = String(`${ddd}${parte1}${parte2}`);

  return numeroFormatado;
}
export const criarPessoaComEndereco = async (req: Request, res: Response) => {
  try {
    const {
      cpf,
      fullName,
      tel,
      password,
      confirmPassword,
      email,
      birthDate,
      type,
      endereco,
    } = req.body;

    console.log(
      "Dados recebidos",
      cpf,
      fullName,
      tel,
      password,
      confirmPassword,
      email,
      birthDate,
      type,
      endereco
    );
    // Verificações dos dados recebidos
    if (!cpf || !fullName || !tel || !birthDate || !type || !endereco) {
      const errorMessage = "Por favor, forneça todos os dados necessários.";
      console.error(errorMessage);
      return res.status(HttpStatus.RequisicaoInvalida).json({
        mensagem: errorMessage,
      });
    }
    console.log("Recebido: ", req.body);

    // Verifica se o usuário já existe
    const existingUser = await prisma.pessoa.findUnique({
      where: { email },
      select: { email: true },
    });

    if (existingUser) {
      console.log("Usuário já existe.");
      return res
        .status(400)
        .json({ success: false, message: "Usuário já existe." });
    }

    // Converte a data do formato brasileiro para o formato ISO (YYYY-MM-DD)
    const formattedBirthDate = parse(birthDate, "dd/mm/yyyy", new Date());

    // Verifica se formattedBirthDate é uma data válida
    if (isNaN(formattedBirthDate.getTime())) {
      console.log("Data de nascimento inválida.");
      return res.status(400).json({
        success: false,
        message:
          "Por favor, forneça uma data de nascimento válida no formato DD/MM/AAAA.",
      });
    }
    const saltRounds = 10;

    // Gera o hash da senha
    const hash = await bcrypt.hash(password, saltRounds);

    // Divide o nome completo em partes
    const [firstName, middleName, lastName] = fullName.split(" ");

    console.log("Dados recebidos para criar pessoa:", req.body);

    const idPessoa = await gerarIdUnico("Pessoa", type);

    console.log("Valores para criar pessoa:", {
      id: idPessoa,
      cpf,
      password: hash,
      firstName,
      middleName,
      lastName,
      tel: formatarTelefone(tel || "0"), // Se tel for undefined, assume o valor padrão "0"
      email,
      birthDate: formatarData(birthDate),
      type: type || RolePessoa.Vistoriador,
      endereco: {
        create: {
          ...endereco,
          id: await gerarIdUnico("Endereco", type),
        },
      },
    });

    // Verifica se o tipo é válido
    if (!Object.values(RolePessoa).includes(type)) {
      throw new Error("Tipo de pessoa inválido");
    }

    const pessoa = await prisma.pessoa.create({
      data: {
        id: idPessoa,
        cpf,
        password: hash,
        firstName,
        middleName,
        lastName,
        tel: formatarTelefone(tel || "0"), // Se tel for undefined, assume o valor padrão "0"
        email,
        birthDate: formatarData(birthDate),
        type,
        endereco: {
          create: {
            ...endereco,
            id: await gerarIdUnico("Endereco", type),
          },
        },
      },
      include: {
        endereco: true,
      },
    });

    console.log("Pessoa criada com sucesso:", pessoa);

    return res.status(HttpStatus.Criado).json(pessoa);
  } catch (error) {
    console.error("Erro ao criar Pessoa", error);

    if (error instanceof ZodError) {
      console.error("Erros de validação:", error.errors);
      return res.status(HttpStatus.EntidadeNaoProcessavel).json({
        mensagem: "Por favor, corrija os seguintes erros:",
        errors: error.errors,
      });
    }

    // Enviar mensagem de erro para o frontend
    return res.status(HttpStatus.ErroInternoServidor).json({
      mensagem:
        "Erro interno do servidor. Consulte os logs para mais informações.",
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const atualizarPessoa = async (req: Request, res: Response) => {
  try {
    const {
      id,
      cpf,
      firstName,
      middleName,
      lastName,
      tel,
      email,
      birthDate,
      type,
      endereco,
    } = req.body;

    const pessoa = await prisma.pessoa.update({
      where: { id },
      data: {
        cpf,
        firstName,
        middleName,
        lastName,
        tel: formatarTelefone(tel), // Modificação aqui
        email,
        birthDate: formatarData(birthDate),
        type,
        endereco: {
          update: {
            ...endereco,
          },
        },
      },
      include: {
        endereco: true,
      },
    });

    return res.status(HttpStatus.Sucesso).json(pessoa);
  } catch (error) {
    console.error("Erro ao atualizar Pessoa", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const buscarPessoas = async (req: Request, res: Response) => {
  try {
    const proprietarios = await prisma.pessoa.findMany({
      where: {
        type: RolePessoa.Proprietario,
      },
      include: {
        endereco: true,
      },
    });

    const inquilinos = await prisma.pessoa.findMany({
      where: {
        type: RolePessoa.Inquilino,
      },
      include: {
        endereco: true,
      },
    });

    const vistoriadores = await prisma.pessoa.findMany({
      where: {
        type: RolePessoa.Vistoriador,
      },
      include: {
        endereco: true,
      },
    });

    const todasPessoas = {
      proprietarios,
      inquilinos,
      vistoriadores,
    };

    return res.status(HttpStatus.Sucesso).json(todasPessoas);
  } catch (error) {
    console.error("Erro ao buscar pessoas por tipo", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const buscarPessoaPorId = async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log("Recebido ID:", id); // Log para verificar o valor do ID

  // Verifica se o ID foi fornecido
  if (!id) {
    console.log("ID não fornecido"); // Log para casos onde o ID não é fornecido
    return res.status(HttpStatus.RequisicaoInvalida).json({ mensagem: "ID é necessário" });
  }

  try {
    // Busca a pessoa pelo ID
    const pessoa = await prisma.pessoa.findUnique({
      where: { id },
      include: {
        endereco: true,
      },
    });

    // Verifica se a pessoa foi encontrada
    if (!pessoa) {
      console.log("Pessoa não encontrada com o ID:", id); // Log para casos onde a pessoa não é encontrada
      return res.status(HttpStatus.NaoEncontrado).json({ mensagem: "Pessoa não encontrada" });
    }

    // Lista dos tipos permitidos
    const tiposPermitidos: (keyof typeof RolePessoa)[] = ["Inquilino", "Proprietario", "Vistoriador"];
    
    // Verifica se o tipo da pessoa está na lista dos tipos permitidos
    if (!tiposPermitidos.includes(pessoa.type as keyof typeof RolePessoa)) {
      console.log("Tipo de pessoa não permitido:", pessoa.type); // Log para tipos de pessoa não permitidos
      return res.status(HttpStatus.RequisicaoInvalida).json({ mensagem: "Tipo de pessoa não é Vistoriador, Inquilino ou Proprietário" });
    }

    // Retorna a pessoa encontrada
    return res.status(HttpStatus.Sucesso).json(pessoa);
  } catch (error) {
    console.error("Erro ao buscar pessoa por ID", error);
    return res.status(HttpStatus.ErroInternoServidor).json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const excluirPessoa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.pessoa.delete({
      where: {
        id,
      },
    });

    return res.status(HttpStatus.Sucesso).json({
      mensagem: "Pessoa excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir Pessoa", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

//GERA ID UNICO BASEADO NO TIPO
const gerarIdUnico = async (
  prefixo: string,
  tipo: RolePessoa
): Promise<string> => {
  const id = `${prefixo}${tipo}${gerarNumeroAleatorio()}`;
  const pessoaExistente = await prisma.pessoa.findUnique({
    where: {
      id,
    },
  });

  if (pessoaExistente !== null) {
    return gerarIdUnico(prefixo, tipo);
  } else {
    return id;
  }
};

// Função para buscar proprietários
export const buscarProprietarios = async (req: Request, res: Response) => {
  try {
    const proprietarios = await prisma.pessoa.findMany({
      where: {
        type: RolePessoa.Proprietario,
      },
      include: {
        endereco: true,
      },
    });

    return res.status(HttpStatus.Sucesso).json(proprietarios);
  } catch (error) {
    console.error("Erro ao buscar proprietários:", error); // Adiciona informações detalhadas do erro
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

// Função para buscar vistoriadores
export const buscarVistoriadores = async (req: Request, res: Response) => {
  try {
    const vistoriadores = await prisma.pessoa.findMany({
      where: {
        type: RolePessoa.Vistoriador,
      },
      include: {
        endereco: true,
      },
    });

    return res.status(HttpStatus.Sucesso).json(vistoriadores);
  } catch (error) {
    console.error("Erro ao buscar vistoriadores", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

// Função para buscar Inquilinos
export const buscarInquilino = async (req: Request, res: Response) => {
  try {
    const inquilino = await prisma.pessoa.findMany({
      where: {
        type: RolePessoa.Inquilino,
      },
      include: {
        endereco: true,
      },
    });

    return res.status(HttpStatus.Sucesso).json(inquilino);
  } catch (error) {
    console.error("Erro ao buscar vistoriadores", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

// export const buscarPessoasPorNome = async (req: Request, res: Response) => {
//   try {
//     const { fullName } = req.params;

//     const pessoas = await prisma.pessoa.findMany({
//       where: {
//         fullName: {
//           contains: fullName,
//         },
//       },
//       include: {
//         endereco: true,
//       },
//     });

//     return res.status(HttpStatus.Sucesso).json(pessoas);
//   } catch (error) {
//     console.error("Erro ao buscar pessoas por nome", error);
//     return res
//       .status(HttpStatus.ErroInternoServidor)
//       .json({ mensagem: "Erro interno do servidor" });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

export const buscarPessoasPorEndereco = async (req: Request, res: Response) => {
  try {
    const { cidade, estado } = req.params;

    const pessoas = await prisma.pessoa.findMany({
      where: {
        endereco: {
          cidade,
          estado,
        },
      },
      include: {
        endereco: true,
      },
    });

    return res.status(HttpStatus.Sucesso).json(pessoas);
  } catch (error) {
    console.error("Erro ao buscar pessoas por endereço", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

export const buscarTodasPessoas = async (req: Request, res: Response) => {
  try {
    const pessoas = await prisma.pessoa.findMany({
      include: {
        endereco: true,
      },
    });

    return res.status(HttpStatus.Sucesso).json(pessoas);
  } catch (error) {
    console.error("Erro ao buscar todas as pessoas", error);
    return res
      .status(HttpStatus.ErroInternoServidor)
      .json({ mensagem: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

const PessoaController = {
  criarPessoaComEndereco,
  atualizarPessoa,
  buscarPessoas,
  excluirPessoa,
  buscarPessoasPorEndereco,
  // gerarPDFPessoas,
  buscarTodasPessoas,
  buscarProprietarios,
  buscarInquilino,
  buscarVistoriadores,
  buscarPessoaPorId,
};
export default PessoaController;
