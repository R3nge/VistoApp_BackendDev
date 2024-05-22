// import { z, ZodError } from "zod";
// import { RolePessoa } from "@prisma/client"; // Certifique-se de que esteja no caminho correto
// import { Request, Response } from "express";

// const isValidCPF = (cpf: string): boolean => {
//   const cpfRegex = /^\d{11}$/;
//   return cpfRegex.test(cpf);
// };

// export const enderecoSchema = z.object({
//   rua: z.string().nonempty({ message: "Rua é obrigatória." }),
//   complemento: z.string().nonempty({ message: "Complemento é obrigatório." }),
//   numero: z
//     .number()
//     .refine((value) => Number.isInteger(value) && value !== 0, {
//       message: "Número é obrigatório.",
//     })
//     .transform((value) => value.toString()),
//   bairro: z.string().nonempty({ message: "Bairro é obrigatório." }),
//   cidade: z.string().nonempty({ message: "Cidade é obrigatória." }),
//   estado: z.string().nonempty({ message: "Estado é obrigatório." }),
//   cep: z.string().nonempty({ message: "CEP é obrigatório." }),
// });

// export const pessoaSchema = z.object({
//   cpf: z
//     .string()
//     .refine((cpf) => isValidCPF(cpf), { message: "CPF inválido." }),
//   name: z.string().nonempty({ message: "Nome é obrigatório." }),
//   tel: z
//     .string()
//     .nonempty({ message: "Telefone é obrigatório." })
//     .or(z.number()),
//   email: z.string().email({ message: "Email inválido." }),
//   type: z
//     .string()
//     .optional()
//     .refine(
//       (value) => Object.values(RolePessoa).includes(value as RolePessoa),
//       { message: "Tipo de pessoa inválido." }
//     ),
//   birthDate: z.string({
//     required_error: "Por favor, selecione uma data.",
//     invalid_type_error: "Formato de data inválido. FORMATO {01/01/2001}.",
//   }),
//   endereco: enderecoSchema,
// });
