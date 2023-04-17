import { withDatabase } from "../withDatabase";
import { Todo } from "./model";

export function createTodo(title: string): Promise<Todo> {
  return withDatabase(async (db) => {
    const result = await db.todo.create({ title });

    return result.dataValues;
  });
}
