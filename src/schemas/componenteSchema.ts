// import { z, ZodError } from "zod";
// import { Cor, Estado, Material, Tipo_Comodo, RolePessoa } from "@prisma/client"; // Substitua pelo caminho correto

// const tiposValidos = Object.values(Tipo_Comodo).join(", ");

// export const componenteSchema = z.object({
//   comodoId: z.string().nonempty({ message: "ComodoId é obrigatório." }),
//   vistoriaId: z.string().nonempty({ message: "VistoriaId é obrigatório." }),
//   // tipo: z
//     .string()
//     .refine(
//       (value) => Object.values(Tipo_Comodo).includes(value as Tipo_Comodo),
//       {
//         message: `Tipo de comodo inválido. Tipos válidos: ${tiposValidos}`,
//       }
//     ),
//   obs: z.string().optional(),
//   cor: z.string().refine((value) => Object.values(Cor).includes(value as Cor), {
//     message: "Cor inválida.",
//   }),
//   estado: z
//     .string()
//     .refine((value) => Object.values(Estado).includes(value as Estado), {
//       message: "Estado inválido.",
//     }),
//   material: z
//     .string()
//     .refine((value) => Object.values(Material).includes(value as Material), {
//       message: "Material inválido.",
//     }),
// });

// export default componenteSchema;
