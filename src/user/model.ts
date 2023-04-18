import z from "zod";
import { Row } from "../withDatabase";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

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

export interface AuthTokens {
  access: string;
  refresh: string;
}

export declare function refreshToken(refreshToken: string): Promise<AuthTokens>;

export declare function validateAuthTokens(
  authTokens: AuthTokens
): Promise<boolean>;
