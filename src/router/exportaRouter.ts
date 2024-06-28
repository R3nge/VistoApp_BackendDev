// exportaRouter.ts
import { Router } from "express";
import exportaController from "../controller/exportaController";
// import ExportaDocController from "../controller/exportaDocController";

const exportaRouter = Router();

exportaRouter.route("/Vistoria/GerarPDF/:id").get(async (req, res) => {
  exportaController.exportarVistoriaParaPDF(req, res);
});


export default exportaRouter;
