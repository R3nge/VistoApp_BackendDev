// app.ts
import express from "express";
import cors from "cors";
import { Client } from "pg";

// Carregar variáveis de ambiente

// Routers import
import {
  userRouter,
  permissionRouter,
  alugaRouter,
  comodoRouter,
  enderecoRouter,
  imovelRouter,
  vinculoRouter,
  pessoaRouter,
  vistoriaRouter,
  itemRouter,
  componenteRouter,
} from "../router";

import exportaRouter from "../router/exportaRouter";

const app = express();

app.use(cors());
app.use(express.json());

// Use routers
app.use("/", userRouter);
app.use("/", permissionRouter);
app.use("/", exportaRouter);
app.use("/", vistoriaRouter);
app.use("/", itemRouter);
app.use("/", componenteRouter);
app.use("/", alugaRouter);
app.use("/", enderecoRouter);
app.use("/", imovelRouter);
app.use("/", comodoRouter);
app.use("/", pessoaRouter);
app.use("/", vinculoRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Ta rodandooo!");
});

// Database connection
const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.SHADOW_DATABASE_URL // Use a URL do banco de dados shadow se NODE_ENV for "test"
    : process.env.DATABASE_URL; // Caso contrário, use a URL do banco de dados principal

if (!databaseUrl) {
  console.error("A variável de ambiente DATABASE_URL não está definida.");
  process.exit(1); // Encerra a execução do aplicativo se a URL do banco de dados não estiver definida
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

client
  .connect()
  .then(() => console.log("Conectado ao banco de dados"))
  .catch((err: any) =>
    console.error("Erro ao conectar ao banco de dados", err)
  );

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app; // Exporta o servidor para uso em testes
