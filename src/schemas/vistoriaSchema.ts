// import { z } from "zod";
// import { Tipo_Comodo, Vistoria } from "@prisma/client"; // Substitua pelo caminho correto

// export const vistoriaSchema = z.object({
//   vistoriadorId: z
//     .string()
//     .nonempty({ message: "VistoriadorId é obrigatório." }),
//   imovelId: z.string().nonempty({ message: "ImovelId é obrigatório." }),
//   data: z
//     .string({
//       required_error: "Por favor, selecione uma data e hora.",
//       invalid_type_error: "Isso não é uma data!",
//     })
//     .pipe(z.coerce.date()),
//   Componente: z
//     .array(
//       z.object({
//         comodoId: z.string().nonempty({ message: "ComodoId é obrigatório." }),
//         tipo: z
//           .string()
//           .refine(
//             (value) =>
//               Object.values(Tipo_Comodo).includes(value as Tipo_Comodo),
//             { message: "Tipo de comodo inválido." }
//           ),
//         obs: z.string().optional(),
//         cor: z.string().optional(),
//         estado: z.string().optional(),
//         material: z.string().optional(),
//       })
//     )
//     .optional(),
// });

// export default vistoriaSchema;
