import { withDatabase } from "../withDatabase";
import { createTodo } from "./createTodo";
import { listTodos } from "./listTodos";

describe("listTodos", () => {
  beforeEach(() => withDatabase((db) => db.todo.truncate()));

  it("should work with no data", async () => {
    const result = await listTodos();
    expect(result).toEqual([]);
  });

  it("should list todos", async () => {
    await Promise.all([
      createTodo("First thing first"),
      createTodo("Second thing second"),
      createTodo("Third thing third"), // Try saying this three times in a row
    ]);

    const result = await listTodos();

    expect(result.length).toBe(3);

    expect(
      result.find((todo) => todo.title === "First thing first")
    ).toBeTruthy();

    expect(
      result.find((todo) => todo.title === "Second thing second")
    ).toBeTruthy();

    expect(
      result.find((todo) => todo.title === "Third thing third")
    ).toBeTruthy();
  });
});
