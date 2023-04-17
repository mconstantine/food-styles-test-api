import { Model } from "sequelize";
import { withDatabase } from "../withDatabase";
import { Todo, TodoInput } from "./model";

export async function getTodoOrThrow(
  id: number
): Promise<Model<Todo, TodoInput>> {
  const todo = await withDatabase((db) => db.todo.findByPk(id));

  if (!todo) {
    throw new Error(`Unable to find todo with id: ${id}`);
  }

  return todo;
}
