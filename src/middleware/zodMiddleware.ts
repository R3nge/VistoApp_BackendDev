import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

const mapZodErrorsToMessages = (error: ZodError): string[] => {
  return error.errors.map((e) => e.message);
};

const validate =
  (schema: AnyZodObject, key?: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = key ? req[key as keyof Request] : req.body || {};
      await schema.parseAsync(data);
      return next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = mapZodErrorsToMessages(err);
        return res
          .status(400)
          .json({ mensagem: "Erro de validação", detalhes: errorMessages });
      } else {
        // Trate outros tipos de erros, se necessário
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
    }
  };

export default validate;
