const { google } = require('googleapis');
const fs = require('fs');

// Carregue suas credenciais do arquivo JSON
const credentials = require('./credentials.json');

// Autentique a aplicação usando as credenciais
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: 'https://www.googleapis.com/auth/drive',
});

// Crie um cliente OAuth2
const drive = google.drive({ version: 'v3', auth });

// Função para fazer upload de um arquivo para o Google Drive
async function uploadFile(filePath, fileName) {
  const fileMetadata = {
    name: fileName,
  };
  const media = {
    mimeType: 'image/jpeg', // Mime type do seu arquivo
    body: fs.createReadStream(filePath),
  };
  const res = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });
  console.log('File uploaded with ID:', res.data.id);
}

// Chamada de exemplo para a função de upload
uploadFile('/path/to/file.jpg', 'nome_do_arquivo.jpg');
