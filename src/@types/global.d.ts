declare namespace Express {
    interface Request {
      user?:
        | string
        | JwtPayload
        | {
            email?: string;
          }
        | undefined;
    }
  }