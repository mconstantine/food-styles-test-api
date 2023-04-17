import { ServerError } from "../ServerError";
import { withDatabase } from "../withDatabase";
import { createTodo } from "./createTodo";
import { deleteTodo } from "./deleteTodo";

describe("deleteTodo", () => {
  it("should return the deleted todo", async () => {
    const todo = await createTodo("Something to be done");
    const result = await deleteTodo(todo.id);

    expect(result.id).toBe(todo.id);

    const deletedTodo = await withDatabase((db) => db.todo.findByPk(todo.id));
    expect(deletedTodo).toBeNull();
  });

  it("should handle not found todos", async () => {
    await expect(deleteTodo(4242)).rejects.toMatchObject(
      new ServerError(404, "Unable to find todo with id: 4242")
    );
  });
});
