import { ServerError } from "./ServerError";

describe("ServerError", () => {
  it("should support instanceof", () => {
    const defaultError = new Error("Some error");
    const serverError = new ServerError(404, "Not found");

    expect(defaultError instanceof Error).toBe(true);
    expect(defaultError instanceof ServerError).toBe(false);
    expect(serverError instanceof Error).toBe(true);
    expect(serverError instanceof ServerError).toBe(true);
  });
});
