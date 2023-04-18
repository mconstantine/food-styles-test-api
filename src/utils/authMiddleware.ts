import { NextFunction, Request, Response } from "express";
import { AuthTokenSubject, validateAuthToken } from "../user/model";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader.length < "Bearer ".length) {
    res.status(401).end();
    return;
  }

  const accessToken = authHeader.slice("Bearer ".length);

  const accessTokenValidationResult = await validateAuthToken(
    accessToken,
    AuthTokenSubject.access
  );

  if (typeof accessTokenValidationResult === "string") {
    res.status(401).end();
    return;
  }

  next();
}
