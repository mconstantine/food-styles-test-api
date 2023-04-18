import { sign } from "jsonwebtoken";
import { withDatabase } from "../withDatabase";
import { AuthTokenSubject, refreshToken, validateAuthToken } from "./model";
import { signUpUser } from "./signUpUser";
import { ServerError } from "../ServerError";

const secret = process.env["AUTH_TOKEN_SECRET"];

describe("user model", () => {
  describe("validateAuthTokens", () => {
    it("should accept valid auth tokens", async () => {
      const tokens = await signUpUser(
        "Validate auth happy path",
        "validate.auth.happy.path@example.com",
        "S0m3P4ss!"
      );

      const user = await withDatabase((db) =>
        db.user.findOne({
          where: { email: "validate.auth.happy.path@example.com" },
        })
      );

      const result = await validateAuthToken(
        tokens.access,
        AuthTokenSubject.access
      );

      expect(result).toEqual(user!.dataValues);
    });

    it("should reject expired auth tokens", async () => {
      await signUpUser(
        "Validate auth expired",
        "validate.auth.expired@example.com",
        "S0m3P4ss!"
      );

      const user = await withDatabase((db) =>
        db.user.findOne({
          where: { email: "validate.auth.expired@example.com" },
        })
      );

      const expiredAccessToken = sign({ id: user!.dataValues.id }, secret!, {
        expiresIn: 0,
        issuer: "api",
        subject: "access",
      });

      const result = await validateAuthToken(
        expiredAccessToken,
        AuthTokenSubject.access
      );

      expect(result).toBe("expired");
    });

    it("should reject invalid auth tokens", async () => {
      await signUpUser(
        "Validate auth invalid",
        "validate.auth.invalid@example.com",
        "S0m3P4ss!"
      );

      const user = await withDatabase((db) =>
        db.user.findOne({
          where: { email: "validate.auth.invalid@example.com" },
        })
      );

      const unknownIssuerAccessToken = sign(
        { id: user!.dataValues.id },
        secret!,
        {
          expiresIn: "1d",
          issuer: "unknown",
          subject: "access",
        }
      );

      const unknownIssuerResult = await validateAuthToken(
        unknownIssuerAccessToken,
        AuthTokenSubject.access
      );

      expect(unknownIssuerResult).toBe("unknown_issuer");

      const unknownSubjectAccessToken = sign(
        { id: user!.dataValues.id },
        secret!,
        {
          expiresIn: "1d",
          issuer: "api",
          subject: "unknown",
        }
      );

      const unknownSubjectResult = await validateAuthToken(
        unknownSubjectAccessToken,
        AuthTokenSubject.access
      );

      expect(unknownSubjectResult).toBe("unknown_subject");
    });

    it("should reject auth tokens for non-existing user", async () => {
      const unknownUserAccessToken = sign({ id: 4242 }, secret!, {
        expiresIn: "1d",
        issuer: "api",
        subject: "access",
      });

      const result = await validateAuthToken(
        unknownUserAccessToken,
        AuthTokenSubject.access
      );

      expect(result).toBe("unknown_user");
    });
  });

  describe("refreshToken", () => {
    it("should produce new access tokens", async () => {
      const tokens = await signUpUser(
        "Refresh token happy path",
        "refresh.token.happy.path@example.com",
        "S0m3P4ss!"
      );

      const user = await withDatabase((db) =>
        db.user.findOne({
          where: { email: "refresh.token.happy.path@example.com" },
        })
      );

      const newTokens = await refreshToken(tokens.refresh);

      expect(
        await validateAuthToken(newTokens.access, AuthTokenSubject.access)
      ).toEqual(user!.dataValues);

      expect(
        await validateAuthToken(newTokens.refresh, AuthTokenSubject.refresh)
      ).toEqual(user!.dataValues);
    });

    it("should handle invalid refresh tokens", async () => {
      const invalidRefreshToken = sign({ id: 4242 }, secret!, {
        expiresIn: 0,
        issuer: "api",
        subject: "refresh",
      });

      await expect(refreshToken(invalidRefreshToken)).rejects.toEqual(
        new ServerError(401, "Invalid refresh token")
      );
    });
  });
});
