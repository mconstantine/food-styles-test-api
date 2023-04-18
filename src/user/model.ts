import z from "zod";
import { Row, withDatabase } from "../withDatabase";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import {
  JsonWebTokenError,
  TokenExpiredError,
  sign,
  verify,
} from "jsonwebtoken";
import { ServerError } from "../ServerError";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export enum AuthTokenSubject {
  access = "access",
  refresh = "refresh",
}

export const UserInput = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(8),
});
export type UserInput = z.infer<typeof UserInput>;

export type User = Row & UserInput;

export const UserLoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type UserLoginInput = z.infer<typeof UserLoginInput>;

export const RefreshTokenInput = z.object({
  refreshToken: z.string().nonempty(),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenInput>;

const secret = process.env["AUTH_TOKEN_SECRET"];

if (!secret) {
  throw new Error("Unable to find environment variable: AUTH_TOKEN_SECRET");
}

export function makeSequelizeUserModel(
  sequelize: Sequelize
): ModelStatic<Model<User, UserInput>> {
  return sequelize.define(
    "User",
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );
}

export function makeAuthTokens(user: User): AuthTokens {
  const access = sign({ id: user.id }, secret!, {
    expiresIn: "14d",
    issuer: "api",
    subject: AuthTokenSubject.access,
  });

  const refresh = sign({ id: user.id }, secret!, {
    expiresIn: "1y",
    issuer: "api",
    subject: AuthTokenSubject.refresh,
  });

  return { access, refresh };
}

export type AuthTokenValidationResult =
  | User
  | "expired"
  | "unknown_issuer"
  | "unknown_subject"
  | "malformed"
  | "unknown_user";

/**
 * Validates an auth token. If the token is valid, it returns the user the token belongs to
 * @param token the token to be verified
 * @param subject the subject that `token` should bare
 * @returns the user the token belongs to, or a reason why the token is not valid
 */
export async function validateAuthToken(
  token: string,
  subject: AuthTokenSubject
): Promise<AuthTokenValidationResult> {
  try {
    const accessToken = verify(token, secret!, {
      issuer: "api",
      subject,
    });

    if (typeof accessToken === "string") {
      return "malformed";
    }

    if (!("id" in accessToken)) {
      return "malformed";
    }

    const user = await withDatabase((db) =>
      db.user.findByPk(accessToken["id"])
    );

    if (!user) {
      return "unknown_user";
    }

    return user.dataValues;
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      return "expired";
    } else if (e instanceof JsonWebTokenError) {
      if (e.message.includes("issuer")) {
        return "unknown_issuer";
      } else if (e.message.includes("subject")) {
        return "unknown_subject";
      } else {
        return "malformed";
      }
    } else {
      console.log(e);
      return "malformed";
    }
  }
}

export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  const refreshTokenValidationResult = await validateAuthToken(
    refreshToken,
    AuthTokenSubject.refresh
  );

  if (typeof refreshTokenValidationResult === "string") {
    throw new ServerError(401, "Invalid refresh token");
  }

  return makeAuthTokens(refreshTokenValidationResult);
}
