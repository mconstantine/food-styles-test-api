import { createTodo } from "./createTodo";
import { markTodoCompleted } from "./markTodoCompleted";
import { markTodoUncompleted } from "./markTodoUncompleted";

describe("markTodoUncompleted", () => {
  it("should flag a todo as completed", async () => {
    const todo = await createTodo("Something to be done");
    const completedTodo = await markTodoCompleted(todo.id);
    const result = await markTodoUncompleted(completedTodo.id);

    expect(result.isDone).toBe(false);
  });

  it("should handle not found todos", async () => {
    await expect(markTodoUncompleted(4242)).rejects.toMatchObject(
      new Error("Unable to find todo with id: 4242")
    );
  });
});
