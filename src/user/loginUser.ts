import { AuthTokens } from "./model";

export declare function loginUser(
  email: string,
  password: string
): Promise<AuthTokens>;
