import { Router } from "express";
import { VinculoController } from "../controller";

const router = Router();

router.post("/Vinculo/CreateVinculo", async (req, res) => {
  VinculoController.criarVinculo(req, res);
});

router.get("/Vinculo/PegarVinculos", async (req, res) => {
  VinculoController.pegarVinculos(req, res);
});

export default router;
