import { createTodo } from "./createTodo";
import { markTodoCompleted } from "./markTodoCompleted";

describe("markTodoCompleted", () => {
  it("should flag a todo as completed", async () => {
    const todo = await createTodo("Something to be done");
    const result = await markTodoCompleted(todo.id);

    expect(result.isDone).toBe(true);
  });

  it("should handle not found todos", async () => {
    await expect(markTodoCompleted(4242)).rejects.toMatchObject(
      new Error("Unable to find todo with id: 4242")
    );
  });
});
