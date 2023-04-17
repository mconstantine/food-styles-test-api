import { withDatabase } from "../withDatabase";
import { Todo } from "./model";

export function deleteTodo(id: number): Promise<Todo> {
  return withDatabase(async (db) => {
    const todo = await db.todo.findByPk(id);

    if (!todo) {
      throw new Error(`Unable to find todo with id: ${id}`);
    }

    await todo.destroy();
    return todo.dataValues;
  });
}
