// // criarImovelSchema.ts

// import { z } from "zod";
// import { Tipo_Imovel } from "../Models/Models";
// import validate from "../middleware/zodMiddleware";

// const criarImovelSchema = z.object({
//   body: z.object({
//     icm: z
//       .string({
//         required_error: "O campo icm é obrigatório.",
//       })
//       .max(20)
//       .min(1),
//     tipo: z
//       .string({
//         required_error: "O campo tipo é obrigatório.",
//       })
//       .refine(
//         (value) => Object.values(Tipo_Imovel).includes(value as Tipo_Imovel),
//         {
//           message: "Tipo de imóvel inválido.",
//         }
//       ),
//     rua: z.string({
//       required_error: "O campo rua é obrigatório.",
//     }),
//     complemento: z.string({
//       required_error: "O campo complemento é obrigatório.",
//     }),
//     numero: z.number({
//       required_error: "O campo numero é obrigatório.",
//     }),
//     bairro: z.string({
//       required_error: "O campo bairro é obrigatório.",
//     }),
//     cidade: z.string({
//       required_error: "O campo cidade é obrigatório.",
//     }),
//     estado: z.string({
//       required_error: "O campo estado é obrigatório.",
//     }),
//     cep: z.string({
//       required_error: "O campo cep é obrigatório.",
//     }),
//     proprietarioId: z.string({
//       required_error: "O campo proprietarioId é obrigatório.",
//     }),
//   }),
// });

// const validarCriarImovel = validate(criarImovelSchema);

// export { validarCriarImovel };
