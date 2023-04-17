import { getTodoOrThrow } from "./getTodoOrThrow";
import { Todo } from "./model";

export async function markTodoCompleted(id: number): Promise<Todo> {
  const todo = await getTodoOrThrow(id);
  const result = await todo.update({ isDone: true });

  return result.dataValues;
}
