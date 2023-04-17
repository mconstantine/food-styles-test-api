import { withDatabase } from "../withDatabase";
import { Todo } from "./model";

export async function createTodo(title: string): Promise<Todo> {
  const result = await withDatabase((db) => db.todo.create({ title }));
  return result.dataValues;
}
