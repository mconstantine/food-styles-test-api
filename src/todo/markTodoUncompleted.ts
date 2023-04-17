import { getTodoOrThrow } from "./getTodoOrThrow";
import { Todo } from "./model";

export async function markTodoUncompleted(id: number): Promise<Todo> {
  const todo = await getTodoOrThrow(id);
  const result = await todo.update({ isDone: false });

  return result.dataValues;
}
