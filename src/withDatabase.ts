import { Model, ModelStatic, Sequelize } from "sequelize";
import { Todo, TodoInput, makeSequelizeTodoModel } from "./todo/model";
import { User, UserInput, makeSequelizeUserModel } from "./user/model";

export interface Row {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DatabaseContext {
  todo: ModelStatic<Model<Todo, TodoInput>>;
  user: ModelStatic<Model<User, UserInput>>;
}

let context: DatabaseContext | null = null;

export async function withDatabase<T>(
  callback: (context: DatabaseContext) => Promise<T>
): Promise<T> {
  if (!context) {
    const env = process.env["NODE_ENV"];

    const sequelize: Sequelize = (() => {
      switch (env) {
        case "production":
          return new Sequelize({
            dialect: "sqlite",
            storage: "data/db.sqlite",
          });
        default:
          return new Sequelize("sqlite::memory:", {
            logging: false,
          });
      }
    })();

    try {
      await sequelize.authenticate();
    } catch (e) {
      console.log("Unable to connect to the database");
      console.log(e);
      process.exit();
    }

    context = {
      todo: makeSequelizeTodoModel(sequelize),
      user: makeSequelizeUserModel(sequelize),
    };

    await context.todo.sync({ force: true });
    await context.user.sync({ force: true });
  }

  return callback(context);
}
