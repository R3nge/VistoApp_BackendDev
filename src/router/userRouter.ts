import userController from "../controller/userController";
import { Router } from "express"; //IMPROTA AS ROTAS DO EXPRESS
import { userCreateSchema, userLoginSchema } from "../schemas"; //UTILIZADO PARA VALIDAÇÃO DE DADOS
import { validate } from "../middleware"; //IMPORTANDO VALIDAÇÃO

const router = Router(); // cria as rotas

// router.post(
//   "/User/CreateUser", //caminho das rotas
//   //validate(userCreateSchema), // validação dos dados
//   async (req, res) => {
//     userController.criarUsuario(req, res); //conectando com a função do controller
//   }
// );

router.post("/User/Login", async (req, res) => {
  userController.fazerLogin(req, res);
});

export default router;
