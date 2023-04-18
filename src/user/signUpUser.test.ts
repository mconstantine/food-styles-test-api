import { ServerError } from "../ServerError";
import { withDatabase } from "../withDatabase";
import { signUpUser } from "./signUpUser";

describe("signUpUser", () => {
  beforeEach(() => withDatabase((db) => db.user.truncate()));

  it("should sign up a user and encrypt the password", async () => {
    await signUpUser("John doe", "john.doe@example.com", "S0m3P4ss!");

    const user = await withDatabase((db) =>
      db.user.findOne({ where: { email: "john.doe@example.com" } })
    );

    expect(user).not.toBeNull();
    expect(user!.dataValues.password).not.toEqual("S0m3P4ss!");
  });

  it("should handle duplicate email address", async () => {
    await signUpUser("John doe", "john.doe@example.com", "S0m3P4ss!");

    await expect(
      signUpUser("Giovanni Giorgio", "john.doe@example.com", "S0me0th3rP4ss!")
    ).rejects.toEqual(
      new ServerError(409, "A user with this email address already exists")
    );
  });
});
