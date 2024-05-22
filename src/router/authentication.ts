// RESPONSÁVEL PELA ROTA DE AUTH, todos passam por aqui.

import { Router } from "express";
import { authenticateJWT, checkPermission } from "../middleware";
import { PermissionController } from "../controller";

const router = Router();

router.put(
  "/Permission/ChangePermission",
  authenticateJWT,
  checkPermission,
  async (req, res) => {
    PermissionController.changePermission(req, res);
  }
);

export default router;
