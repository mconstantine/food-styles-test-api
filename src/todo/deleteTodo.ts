import { getTodoOrThrow } from "./getTodoOrThrow";
import { Todo } from "./model";

export async function deleteTodo(id: number): Promise<Todo> {
  const todo = await getTodoOrThrow(id);
  await todo.destroy();
  return todo.dataValues;
}
