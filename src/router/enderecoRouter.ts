import { Router } from "express";
import { EnderecoPessoaController } from "../controller";

const router = Router();

router.post("/Endereco/CreateEndereco", async (req, res) => {
  EnderecoPessoaController.criarEndereco(req, res);
});

router.get("/Endereco/PegarEnderecos", async (req, res) => {
  EnderecoPessoaController.pegarEnderecos(req, res);
});

router.get("/Endereco/PegarEnderecoPorId/:id", async (req, res) => {
  EnderecoPessoaController.pegarEnderecoPorId(req, res);
});

router.get("/Endereco/PegarEnderecoPorRua/:rua", async (req, res) => {
  EnderecoPessoaController.pegarEnderecoPorRua(req, res);
});

router.get("/Endereco/PegarEnderecosPorCidade/:cidade", async (req, res) => {
  EnderecoPessoaController.pegarEnderecosPorCidade(req, res);
});

router.get("/Endereco/PegarEnderecosPorCep/:cep", async (req, res) => {
  EnderecoPessoaController.pegarEnderecosPorCep(req, res);
});

export default router;
