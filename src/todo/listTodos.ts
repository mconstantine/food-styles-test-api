import { withDatabase } from "../withDatabase";
import { Todo } from "./model";

export async function listTodos(): Promise<Todo[]> {
  return withDatabase(async (db) => {
    const todos = await db.todo.findAll();
    return todos.map((todo) => todo.dataValues);
  });
}
