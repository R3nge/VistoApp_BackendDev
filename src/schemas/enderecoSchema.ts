// // AQUI FAREMOS AS VERIFICAÇÕES E TRATAMENTOS DE DADOS
// import { z } from "zod";
// import { validate } from "../middleware";

// const criarEnderecoSchema = z.object({
//   body: z.object({
//     rua: z.string().nonempty({ message: "Rua é obrigatória." }),
//     complemento: z.string().nonempty({ message: "Complemento é obrigatório." }),
//     numero: z.string().nonempty({ message: "Número é obrigatório." }),
//     bairro: z.string().nonempty({ message: "Bairro é obrigatório." }),
//     cidade: z.string().nonempty({ message: "Cidade é obrigatória." }),
//     estado: z.string().nonempty({ message: "Estado é obrigatório." }),
//     cep: z.string().nonempty({ message: "CEP é obrigatório." }),
//   }),
// });

// const validarCriarEndereco = validate(criarEnderecoSchema);

// export { validarCriarEndereco };
