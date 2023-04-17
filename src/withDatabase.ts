import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

interface Todo {
  content: string;
  isDone: boolean;
}

interface DatabaseContext {
  todo: ModelStatic<Model<Todo>>;
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
          return new Sequelize("sqlite::memory:");
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
      todo: sequelize.define("Todo", {
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        isDone: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
      }),
    };
  }

  return callback(context);
}
