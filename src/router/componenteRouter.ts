// componenteRouter.js
import { Router } from "express";
import { ComponenteController } from "../controller";

const router = Router();

router.post("/:vistoriaId/:comodoId/criarComponente", async (req, res) => {
  ComponenteController.criarComponente(req, res);
});

router.put("/atualizarComponente/:componenteId/:comodoId", async (req, res) => {
  ComponenteController.atualizarComponente(req, res);
});

router.delete("/excluirComponente/:id", async (req, res) => {
  ComponenteController.excluirComponente(req, res);
});

router.get("/obterUltimaVistoriaUsuario", async (req, res) => {
  ComponenteController.obterUltimaVistoriaUsuario(req, res);
});

router.get("/obterUltimoComodoUsuario", async (req, res) => {
  ComponenteController.obterUltimoComodoUsuario(req, res);
});

router.get("/buscarComponentesPorComodo/:comodoId", async (req, res) => {
  ComponenteController.buscarComponentesPorComodo(req, res);
});

export default router;
