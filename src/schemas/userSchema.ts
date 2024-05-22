import { z } from "zod";

const userCreateSchema = z.object({
  body: z
    .object({
      fullName: z
        .string({
          required_error: "O nome completo é obrigatório.",
        })
        .max(50)
        .min(5),
      password: z
        .string({
          required_error: "A senha é obrigatória.",
        })
        .max(50)
        .min(5),
      confirmPassword: z.string({
        required_error: "A confirmação de senha é obrigatória.",
      }),
      birthDate: z
        .string({
          required_error: "Por favor, selecione uma data e hora.",
          invalid_type_error: "Isso não é uma data!",
        })
        .pipe(z.coerce.date())
        .refine(
          (date) => {
            const ageDifMs = Date.now() - date.getTime();
            const ageDate = new Date(ageDifMs);

            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            return age >= 18;
          },
          { message: "Você deve ter 18 anos ou mais" }
        ),
      email: z
        .string({
          required_error: "O e-mail é obrigatório.",
        })
        .max(50)
        .email("E-mail inválido."),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          message: "As senhas não coincidiram.",
        });
      }
    }),
});

const userLoginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "O e-mail é obrigatório.",
      })
      .email("E-mail inválido."),
  }),
});

export { userCreateSchema, userLoginSchema };
