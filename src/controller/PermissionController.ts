import prisma from "../../database/prisma";
import { Request, Response } from "express";

export const changePermission = async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.body ?? {};

    if (!req.user || !req.user.canChangePermissions) {
      return res.status(403).json({
        error: "Você não tem permissão para modificar as permissões.",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        type: type,
      },
    });

    // Registre a mudança nas permissões no log.
    console.log(
      `Permissões do usuário ${userId} alteradas para ${type} por ${req.user.id}`
    );

    res
      .status(200)
      .json({ success: true, message: `Permissões alteradas com sucesso.` });
  } catch (err) {
    // Registre o erro no log.
    console.error("Erro ao alterar permissões:", err);

    res
      .status(400)
      .json({ error: err, message: "Falha ao alterar permissões." });
  }
};

const PermissionController = {
  changePermission,
};

export default PermissionController;
