import z from "zod";
import { Row } from "../withDatabase";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export const TodoInput = z.object({
  title: z.string().nonempty(),
});
export type TodoInput = z.infer<typeof TodoInput>;

export type Todo = Row &
  TodoInput & {
    isDone: boolean;
  };

export function makeSequelizeTodoModel(
  sequelize: Sequelize
): ModelStatic<Model<Todo, TodoInput>> {
  return sequelize.define("Todo", {
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isDone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
}
