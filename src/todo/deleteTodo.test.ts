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
});
