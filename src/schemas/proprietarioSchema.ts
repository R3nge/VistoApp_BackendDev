// import { z } from "zod";

// const proprietarioCreateSchema = z.object({
//   cpf: z.string().nonempty({ message: "O campo 'cpf' é obrigatório." }),
//   name: z.string().nonempty({ message: "O campo 'name' é obrigatório." }),
//   tel: z.number().int({ message: "O campo 'tel' deve ser um número inteiro." }),
//   email: z
//     .string()
//     .email({ message: "O campo 'email' deve ser um e-mail válido." }),
//   Tipo_pessoa: z
//     .string()
//     .nonempty({ message: "O campo 'Tipo_pessoa' é obrigatório." }),
//   birthDate: z
//     .string({
//       required_error: "Por favor, selecione uma data e hora.",
//       invalid_type_error: "Isso não é uma data!",
//     })
//     .pipe(z.coerce.date())
//     .refine(
//       (date) => {
//         const ageDifMs = Date.now() - date.getTime();
//         const ageDate = new Date(ageDifMs);

//         const age = Math.abs(ageDate.getUTCFullYear() - 1970);

//         return age >= 18;
//       },
//       { message: "Você deve ter 18 anos ou mais" }
//     ),
// });

// export { proprietarioCreateSchema };
