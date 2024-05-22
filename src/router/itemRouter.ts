// itemAcessorioRouter.js
import { Router } from "express";
import { ItemController } from "../controller";

const router = Router();

router.post("/criarItemPrincipal", async (req, res) => {
  ItemController.criarItemPrincipal(req, res);
});

router.get("/buscarItemPrincipal/:id", async (req, res) => {
  ItemController.buscarItemPrincipal(req, res);
});

router.delete("/excluirItemPrincipal/:id", async (req, res) => {
  ItemController.excluirItemPrincipal(req, res);
});

router.post("/criarItemAcessorio", async (req, res) => {
  ItemController.criarItemAcessorio(req, res);
});

router.get("/buscarItemAcessorio/:id", async (req, res) => {
  ItemController.buscarItemAcessorio(req, res);
});

router.delete("/excluirItemAcessorio/:id", async (req, res) => {
  ItemController.excluirItemAcessorio(req, res);
});

export default router;
