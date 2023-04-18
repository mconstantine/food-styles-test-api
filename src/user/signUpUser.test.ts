import { ServerError } from "../ServerError";
import { withDatabase } from "../withDatabase";
import { signUpUser } from "./signUpUser";

describe("signUpUser", () => {
  it("should sign up a user and encrypt the password", async () => {
    await signUpUser(
      "SignUp happy path",
      "signup.happy.path@example.com",
      "S0m3P4ss!"
    );

    const user = await withDatabase((db) =>
      db.user.findOne({ where: { email: "signup.happy.path@example.com" } })
    );

    expect(user).not.toBeNull();
    expect(user!.dataValues.password).not.toEqual("S0m3P4ss!");
  });

  it("should handle duplicate email address", async () => {
    await signUpUser(
      "SignUp duplicate",
      "signup.duplicate@example.com",
      "S0m3P4ss!"
    );

    await expect(
      signUpUser(
        "Giovanni Giorgio",
        "signup.duplicate@example.com",
        "S0me0th3rP4ss!"
      )
    ).rejects.toEqual(
      new ServerError(409, "A user with this email address already exists")
    );
  });
});
