import { Router } from "express";
import { authenticateJWT, checkPermission, validate } from "../middleware";
import { AlugaController } from "../controller";

const router = Router();

router.post("/Aluga/CreateAluguel", async (req, res) => {
  AlugaController.Alugar(req, res);
});

router.get("/Aluga/PegarAluga", async (req, res) => {
  AlugaController.pegarAlugueis(req, res);
});
export default router;
