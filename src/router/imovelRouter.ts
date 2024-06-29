import { Router } from "express";
import { ImovelController } from "../controller";
import {
  getFotosImovel,
  uploadFotoImovel,
} from "../controller/ImovelController";
import multer from "multer";
// import { validarCriarImovel } from "../schemas/imovelSchema"; // Substitua com o caminho correto

const router = Router();
const upload = multer();

// Rota para upload de fotos para Imóvel
router.put("/uploadFotoImovel/:imovelId", upload.any(), uploadFotoImovel);

// Rota para buscar as fotos de um Imóvel
router.get("/getFotosImovel/:imovelId", async (req, res) => {
  return getFotosImovel(req, res);
});

router.post("/imovel/criar", async (req, res) => {
  ImovelController.criarImovel(req, res);
});

router.put("/imovel/atualizar/:id", async (req, res) => {
  ImovelController.atualizarImovel(req, res);
});

router.get("/imovel/listar", async (req, res) => {
  ImovelController.pegarImoveis(req, res);
});

router.get("/imovel/por-id/:id", async (req, res) => {
  ImovelController.pegarImovelPorId(req, res);
});

router.get("/imovel/por-icm", async (req, res) => {
  ImovelController.pegarImovelPorICM(req, res);
});

router.get("/imovel/por-tipo", async (req, res) => {
  ImovelController.pegarImoveisPorTipo(req, res);
});

router.get("/imovel/por-nome", async (req, res) => {
  ImovelController.pegarImovelPorNome(req, res);
});

router.delete("/imovel/excluir/:id", async (req, res) => {
  ImovelController.excluirImovel(req, res);
});

export default router;
