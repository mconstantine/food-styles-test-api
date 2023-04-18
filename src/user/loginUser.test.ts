import { JwtPayload, verify } from "jsonwebtoken";
import { loginUser } from "./loginUser";
import { signUpUser } from "./signUpUser";
import { withDatabase } from "../withDatabase";
import { ServerError } from "../ServerError";

const secret = process.env["AUTH_TOKEN_SECRET"];

describe("loginUser", () => {
  it("should log a user in", async () => {
    await signUpUser(
      "Login happy path",
      "login.happy.path@example.com",
      "S0m3P4ss!"
    );

    const user = await withDatabase((db) =>
      db.user.findOne({ where: { email: "login.happy.path@example.com" } })
    );

    const tokens = await loginUser("login.happy.path@example.com", "S0m3P4ss!");

    const accessToken = verify(tokens.access, secret!, {
      issuer: "api",
      subject: "access",
    }) as JwtPayload;

    const refreshToken = verify(tokens.refresh, secret!, {
      issuer: "api",
      subject: "refresh",
    }) as JwtPayload;

    expect(accessToken["id"]).toBe(user!.dataValues.id);
    expect(accessToken.iss).toBe("api");
    expect(accessToken.sub).toBe("access");
    expect(accessToken.exp).toBeGreaterThan(Date.now() / 1000);

    expect(refreshToken["id"]).toBe(user!.dataValues.id);
    expect(refreshToken.iss).toBe("api");
    expect(refreshToken.sub).toBe("refresh");
    expect(refreshToken.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("should handle not found users (wrong email)", async () => {
    await expect(
      loginUser("login.not.found@example.com", "whatever")
    ).rejects.toEqual(
      new ServerError(401, "Invalid email address or password")
    );
  });

  it("should handle wrong password", async () => {
    await signUpUser(
      "Login wrong password",
      "login.wrong.password@example.com",
      "S0m3P4ss!"
    );

    await expect(
      loginUser("login.wrong.password@example.com", "wrong")
    ).rejects.toEqual(
      new ServerError(401, "Invalid email address or password")
    );
  });
});
