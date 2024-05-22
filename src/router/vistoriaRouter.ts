import { Router } from "express";
import VistoriaController from "../controller/VistoriaController";

const router = Router();

// vistoriaRoutes.ts

router.post(
  "/Vistoria/CreateVistoria/:imovelId/:usuarioId",
  async (req, res) => {
    VistoriaController.criarVistoria(req, res);
  }
);

router.get("/Vistoria/PegarVistorias", async (req, res) => {
  const { searchText, sortType } = req.query;
  VistoriaController.obterVistorias(req, res, searchText, sortType);
});

router.get("/Vistoria/UltimaVistoria", async (req, res) => {
  VistoriaController.obterUltimaVistoria(req, res);
});

router.put("/Vistoria/AtualizarVistoria/:id", async (req, res) => {
  VistoriaController.atualizarVistoria(req, res);
});

router.get("/Vistoria/PegarVistoria/:id", async (req, res) => {
  VistoriaController.obterVistoriaPorId(req, res);
});

router.get("/Vistoria/PegarVistoriaC/:id", async (req, res) => {
  VistoriaController.pegarVistoriaCompleta(req, res);
});

export default router;
