import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

function checkPermission(req: Request, res: Response, next: NextFunction) {
  const tokenHeader = req.header("Authorization");

  if (tokenHeader === undefined) {
    const logId = generateLogId();
    console.error(`Acesso negado [${logId}]: Token não fornecido.`);
    return res.json({ status: 403, message: "Acesso negado.", logId: logId });
  }

  const [prefix, token] = tokenHeader.split(" ");

  const permission = jwt.decode(token) as JwtPayload;

  if (permission?.type === "Member") {
    const logId = generateLogId();
    console.error(`Acesso negado [${logId}]: Tipo de permissão inválido.`);
    res.json({ status: 403, message: "Acesso negado.", logId: logId });
  }

  next();
}

export default checkPermission;
function generateLogId() {
  throw new Error("Function not implemented.");
}
