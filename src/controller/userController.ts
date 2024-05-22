import { Request, Response } from "express";
import prisma from "../../database/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RolePessoa } from "@prisma/client";
import { parse } from "date-fns";

const saltRounds = 10;

export const fazerLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  try {
    console.log("Recebido: ", req.body);

    // Busca o usuário no banco de dados
    const login = await prisma.pessoa.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, type: true },
    });

    const userId = login?.id; // Assuming id is the field in your database representing the user's ID

    // Compara as senhas
    const match = await bcrypt.compare(password, String(login?.password));

    if (!login || !match) {
      console.log("Usuário não encontrado ou senha incorreta.");
      return res.status(400).json({
        success: false,
        message: "Usuário não encontrado ou senha incorreta.",
      });
    }

    // Gera o token JWT
    const token = jwt.sign({ email, type: login?.type }, "senha_secreta");

    console.log("Token gerado:", token);

    res.status(200).json({ jwt: `Bearer ${token}, User ID: ${userId}` });
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    return res
      .status(400)
      .json({ success: false, message: "Erro ao fazer login." });
  } finally {
    await prisma.$disconnect();
  }
};

const userController = {
  fazerLogin,
};

export default userController;
