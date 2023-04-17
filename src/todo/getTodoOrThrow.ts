import { Model } from "sequelize";
import { withDatabase } from "../withDatabase";
import { Todo, TodoInput } from "./model";
import { ServerError } from "../ServerError";

export async function getTodoOrThrow(
  id: number
): Promise<Model<Todo, TodoInput>> {
  const todo = await withDatabase((db) => db.todo.findByPk(id));

  if (!todo) {
    throw new ServerError(404, `Unable to find todo with id: ${id}`);
  }

  return todo;
}
