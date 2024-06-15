import { Router } from "express";
import { ComponenteController } from "../controller";
import multer from "multer";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

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

// Nova rota para upload de fotos
// Altere upload.array('fotos', 10) para upload.any()
router.put(
  "/uploadFotoComponente/:componenteId/:tipo",
  upload.any(),
  async (req, res) => {
    return ComponenteController.uploadFotoComponente(req, res);
  }
);

// Rota para buscar as fotos de um componente

router.get("/getFotosComponente/:componenteId", async (req, res) => {
  ComponenteController.getFotosComponente(req, res);
});

export default router;
