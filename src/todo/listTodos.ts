import { withDatabase } from "../withDatabase";
import { Todo } from "./model";

export async function listTodos(): Promise<Todo[]> {
  const todos = await withDatabase((db) => db.todo.findAll());
  return todos.map((todo) => todo.dataValues);
}
