// routes.ts
import { Router } from "express";
import { ComodoController } from "../controller";
import { Cor, Estado, Material } from "@prisma/client";

const router = Router();

router.post("/Comodo/:imovelId//CriarComodo", async (req, res) => {
  ComodoController.criarComodo(req, res);
});

router.post(
  "/Comodo/:imovelId/:vistoriaId/CriarComodoComComponentes",
  async (req, res) => {
    ComodoController.criarComodoComComponentes(req, res);
  }
);

/// COMODO GET
router.get("/comodoget/:imovelId", async (req, res) => {
  ComodoController.pegarComodosPorImovel(req, res);
});
router.get("/Comodo/UltimoComodo", async (req, res) => {
  ComodoController.obterUltimoComodo(req, res);
});

router.put("/Comodo/:imovelId/:comodoId", async (req, res) => {
  ComodoController.atualizarComodo(req, res); // Definindo a rota para atualizar o cômodo
});

router.delete("/Comodo/:comodoId", async (req, res) => {
  ComodoController.excluirComodo(req, res);
});

router.get("/Comodo/:comodoId/UltimoComodoComponente", async (req, res) => {
  ComodoController.buscarUltimosComodosComComponentes(req, res);
});

export default router;
