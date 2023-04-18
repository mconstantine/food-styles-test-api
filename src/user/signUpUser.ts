import { AuthTokens } from "./model";

export declare function signUpUser(
  name: string,
  email: string,
  password: string
): Promise<AuthTokens>;
