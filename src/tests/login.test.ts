const request = require("supertest");
const app = require("../app/index"); // seu arquivo principal do Express

describe("Testes de criação de usuário e login", () => {
  let token = ""; // para armazenar o token JWT gerado

  test("Deve criar um novo usuário", async () => {
    const response = await request(app).post("/User/CreateUser").send({
      password: "34215584",
      confirmPassword: "34215584",
      fullName: "Rodrigo Gomes Malaquias",
      birthDate: "29/01/2003",
      type: "Adm",
      email: "digo.rodrigomalaquias@hotmail.com",
    });

    expect(response.statusCode).toBe(201);
  });

  test("Deve fazer login com o usuário criado", async () => {
    const response = await request(app).post("/User/Login").send({
      email: "digo.rodrigomalaquias@hotmail.com",
      password: "34215584",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.jwt).toBeDefined();
    token = response.body.jwt;
  });

  test("Deve falhar ao tentar criar um usuário com o mesmo email", async () => {
    const response = await request(app).post("/User/CreateUser").send({
      password: "34215584",
      confirmPassword: "34215584",
      fullName: "Rodrigo Gomes Malaquias",
      birthDate: "29/01/2003",
      type: "Adm",
      email: "digo.rodrigomalaquias@hotmail.com",
    });

    expect(response.statusCode).toBe(400);
  });

  test("Deve falhar ao tentar fazer login com senha incorreta", async () => {
    const response = await request(app).post("/User/Login").send({
      email: "digo.rodrigomalaquias@hotmail.com",
      password: "senhaerrada",
    });

    expect(response.statusCode).toBe(400);
  });
});
