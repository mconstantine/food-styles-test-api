import { ServerError } from "../ServerError";
import { withDatabase } from "../withDatabase";
import { AuthTokens, makeAuthTokens } from "./model";
import { compareSync } from "bcryptjs";

export async function loginUser(
  email: string,
  password: string
): Promise<AuthTokens> {
  const error = "Invalid email address or password";

  const user = await withDatabase((db) =>
    db.user.findOne({ where: { email } })
  );

  if (!user || !compareSync(password, user.dataValues.password)) {
    throw new ServerError(401, error);
  }

  return makeAuthTokens(user.dataValues);
}
