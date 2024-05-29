// exportaRouter.ts
import { Router } from "express";
import exportaController from "../controller/exportaController";
// import ExportaDocController from "../controller/exportaDocController";

const exportaRouter = Router();

exportaRouter.route("/Vistoria/GerarPDF/:id").get(async (req, res) => {
  exportaController.exportarVistoriaParaPDF(req, res);
});

// exportaRouter
//   .route("/Vistoria/GerarPDFUltima")
//   .get(async (req, res) => {
//     exportaController.exportarUltimaVistoriaParaPDF(req, res);
//   })
//   .post(async (req, res) => {
//     exportaController.exportarUltimaVistoriaParaPDF(req, res);
//   });

// exportaRouter
//   .route("/Vistoria/GerarDOC/:id") // Rota para gerar DOCX
//   .get(async (req, res) => {
//     ExportaDocController.exportarVistoriaParaDOC(req, res);
//   })
//   .post(async (req, res) => {
//     ExportaDocController.exportarVistoriaParaDOC(req, res);
//   });

export default exportaRouter;
