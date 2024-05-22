import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const tokenHeader = req.header("Authorization");

  if (!tokenHeader) {
    const logId = generateLogId();
    console.error(`Token inválido [${logId}]: Token ausente.`);
    return res
      .status(400)
      .json({ success: false, message: "Token inválido.", logId: logId });
  }

  const [prefix, token] = tokenHeader.split(" ");

  if (prefix !== "Bearer") {
    const logId = generateLogId();
    console.error(`Formato do token inválido [${logId}].`);
    return res.status(401).json({
      success: false,
      message: "Formato do token inválido.",
      logId: logId,
    });
  }

  if (!token) {
    const logId = generateLogId();
    console.error(`Token ausente [${logId}].`);
    return res
      .status(401)
      .json({ success: false, message: "Token ausente.", logId: logId });
  }

  jwt.verify(token, "password", (err, user) => {
    if (err) {
      const logId = generateLogId();
      console.error(`Não autorizado [${logId}]:`, err);
      return res
        .status(403)
        .json({ success: false, message: "Não autorizado.", logId: logId });
    }
    req.user = user;
    next();
  });
}

export default authenticateJWT;
function generateLogId() {
  throw new Error("Function not implemented.");
}
