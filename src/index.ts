import express from "express";
import meta from "../package.json";
import { withDatabase } from "./withDatabase";
import { TodoInput } from "./todo/model";
import { createTodo } from "./todo/createTodo";
import z from "zod";
import { markTodoCompleted } from "./todo/markTodoCompleted";
import { markTodoUncompleted } from "./todo/markTodoUncompleted";
import { deleteTodo } from "./todo/deleteTodo";
import { listTodos } from "./todo/listTodos";
import { ServerError } from "./ServerError";

const app = express();

app.use(express.json());

(async () => {
  await withDatabase(() => Promise.resolve());

  app.get("/", (_req, res) => {
    res.json({
      name: meta.name,
      version: meta.version,
    });
  });

  app.post("/todos", async (req, res) => {
    const input = TodoInput.safeParse(req.body);

    if (input.success) {
      try {
        const todo = await createTodo(input.data.title);
        return res.json(todo);
      } catch (e) {
        console.log(e);
        return res.status(500).end();
      }
    } else {
      return res.status(422).json(input.error);
    }
  });

  app.get("/todos", async (_req, res) => {
    try {
      const result = await listTodos();
      return res.json(result);
    } catch (e) {
      console.log(e);
      return res.status(500).end();
    }
  });

  app.put("/todos/:id/mark-completed", async (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);

    if (id.success) {
      try {
        const result = await markTodoCompleted(id.data);
        return res.json(result);
      } catch (e) {
        console.log(e);

        if (e instanceof ServerError) {
          return res.status(e.code).end();
        } else {
          return res.status(500).end();
        }
      }
    } else {
      return res.status(422).json(id.error);
    }
  });

  app.put("/todos/:id/mark-uncompleted", async (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);

    if (id.success) {
      try {
        const result = await markTodoUncompleted(id.data);
        return res.json(result);
      } catch (e) {
        console.log(e);

        if (e instanceof ServerError) {
          return res.status(e.code).end();
        } else {
          return res.status(500).end();
        }
      }
    } else {
      return res.status(422).json(id.error);
    }
  });

  app.delete("/todos/:id", async (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);

    if (id.success) {
      try {
        const result = await deleteTodo(id.data);
        return res.json(result);
      } catch (e) {
        console.log(e);

        if (e instanceof ServerError) {
          return res.status(e.code).end();
        } else {
          return res.status(500).end();
        }
      }
    } else {
      return res.status(422).json(id.error);
    }
  });

  app.listen(5000, () => console.log("Server ready at port 5000"));
})();
