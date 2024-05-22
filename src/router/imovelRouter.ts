import { Router } from "express";
import { ImovelController } from "../controller";
// import { validarCriarImovel } from "../schemas/imovelSchema"; // Substitua com o caminho correto

const router = Router();

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
