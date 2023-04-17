import { createTodo } from "./createTodo";

describe("createTodo", () => {
  it("should save a todo into the database", async () => {
    const todo = await createTodo("something to be done");

    expect(todo.title).toBe("something to be done");
    expect(todo.isDone).toBe(false);
  });
});
