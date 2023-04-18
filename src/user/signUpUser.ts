import { ServerError } from "../ServerError";
import { withDatabase } from "../withDatabase";
import { AuthTokens, makeAuthTokens } from "./model";
import { hashSync } from "bcryptjs";

export async function signUpUser(
  name: string,
  email: string,
  password: string
): Promise<AuthTokens> {
  const passwordHash = hashSync(password);

  try {
    const user = await withDatabase((db) =>
      db.user.create({ name, email, password: passwordHash })
    );

    return makeAuthTokens(user.dataValues);
  } catch (e) {
    const error = e as any;

    if (
      "errors" in error &&
      error.errors.length === 1 &&
      "validatorKey" in error.errors[0] &&
      error.errors[0].validatorKey === "not_unique"
    ) {
      throw new ServerError(
        409,
        "A user with this email address already exists"
      );
    } else {
      throw e;
    }
  }
}
