import { Router } from "express";
import { PessoaController } from "../controller";

const router = Router();

router.post("/criarPessoa", async (req, res) => {
  await PessoaController.criarPessoaComEndereco(req, res);
});

router.put("/atualizarPessoa", async (req, res) => {
  await PessoaController.atualizarPessoa(req, res);
});

router.get("/buscarPessoas", async (req, res) => {
  await PessoaController.buscarTodasPessoas(req, res);
});

router.delete("/excluirPessoa/:id", async (req, res) => {
  await PessoaController.excluirPessoa(req, res);
});

router.get("/buscarInquilino", async (req, res) => {
  await PessoaController.buscarInquilino(req, res);
});

router.get("/buscarVistoriador", async (req, res) => {
  await PessoaController.buscarVistoriadores(req, res);
});

router.get("/buscarProprietario", async (req, res) => {
  await PessoaController.buscarProprietarios(req, res);
});

// router.get("/buscarPorNome/:nome", async (req, res) => {
//   await PessoaController.buscarPessoasPorNome(req, res);
// });

router.get("/buscarPorEndereco/:cidade/:estado", async (req, res) => {
  await PessoaController.buscarPessoasPorEndereco(req, res);
});

// // GERADORES DE PDF
// router.get("/gerarPDFPessoas/:tipo", async (req, res) => {
//   await PessoaController.gerarPDFPessoas(req, res);
// });

export default router;
