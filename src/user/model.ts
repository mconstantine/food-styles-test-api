import z from "zod";
import { Row } from "../withDatabase";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { sign } from "jsonwebtoken";

export interface AuthTokens {
  access: string;
  refresh: string;
}

const secret = process.env["AUTH_TOKEN_SECRET"];

if (!secret) {
  throw new Error("Unable to find environment variable: AUTH_TOKEN_SECRET");
}

export const UserInput = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(8),
});
export type UserInput = z.infer<typeof UserInput>;

export type User = Row & UserInput;

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
    subject: "access",
  });

  const refresh = sign({ id: user.id }, secret!, {
    expiresIn: "1y",
    issuer: "api",
    subject: "refresh",
  });

  return { access, refresh };
}

export declare function refreshToken(refreshToken: string): Promise<AuthTokens>;

export declare function validateAuthTokens(
  authTokens: AuthTokens
): Promise<boolean>;
