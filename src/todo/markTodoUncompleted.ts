import { withDatabase } from "../withDatabase";
import { Todo } from "./model";

export async function markTodoUncompleted(id: number): Promise<Todo> {
  return withDatabase(async (db) => {
    const todo = await db.todo.findByPk(id);

    if (!todo) {
      throw new Error(`Unable to find todo with id: ${id}`);
    }

    const result = await todo.update({ isDone: false });
    return result.dataValues;
  });
}
