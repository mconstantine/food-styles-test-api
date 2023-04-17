import { withDatabase } from "../withDatabase";
import { createTodo } from "./createTodo";
import { listTodos } from "./listTodos";
import { markTodoCompleted } from "./markTodoCompleted";

describe("listTodos", () => {
  beforeEach(() => withDatabase((db) => db.todo.truncate()));

  it("should work with no data", async () => {
    const result = await listTodos("all");
    expect(result).toEqual([]);
  });

  it("should list all todos", async () => {
    await Promise.all([
      createTodo("First thing first"),
      createTodo("Second thing second"),
      createTodo("Third thing third"), // Try saying this three times in a row
    ]);

    const result = await listTodos("all");

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

  it("should list completed todos", async () => {
    const [completed] = await Promise.all([
      createTodo("Completed"),
      createTodo("Not completed"),
    ]);
    await markTodoCompleted(completed.id);

    const result = await listTodos("completed");

    expect(result.length).toBe(1);
    expect(result.find((todo) => todo.title === "Completed")).toBeTruthy();

    expect(
      result.find((todo) => todo.title === "Not completed")
    ).not.toBeTruthy();
  });

  it("should list uncompleted todos", async () => {
    const [completed] = await Promise.all([
      createTodo("Completed"),
      createTodo("Not completed"),
    ]);
    await markTodoCompleted(completed.id);

    const result = await listTodos("uncompleted");

    expect(result.length).toBe(1);
    expect(result.find((todo) => todo.title === "Completed")).not.toBeTruthy();
    expect(result.find((todo) => todo.title === "Not completed")).toBeTruthy();
  });
});
