import z from "zod";
import { withDatabase } from "../withDatabase";
import { Todo } from "./model";

export const ListTodosFilter = z.object({
  filter: z.enum(["all", "completed", "uncompleted"]),
});
export type ListTodosFilter = z.infer<typeof ListTodosFilter>;

export async function listTodos(
  filter: ListTodosFilter["filter"]
): Promise<Todo[]> {
  const where = (() => {
    switch (filter) {
      case "all":
        return {};
      case "completed":
        return { isDone: true };
      case "uncompleted":
        return { isDone: false };
    }
  })();

  const todos = await withDatabase((db) =>
    db.todo.findAll({
      order: [["updatedAt", "DESC"]],
      where,
    })
  );

  return todos.map((todo) => todo.dataValues);
}
