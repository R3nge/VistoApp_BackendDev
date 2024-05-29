import { google } from "googleapis";
import path from "path";

// Caminho para o arquivo JSON com as credenciais
const KEYFILEPATH = path.join(__dirname, "credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Autenticar o cliente
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

export { drive };
