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
import { makeEndpoint } from "./utils/makeEndpoint";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

(async () => {
  await withDatabase(() => Promise.resolve());

  app.get("/", (_req, res) => {
    return res.json({
      name: meta.name,
      version: meta.version,
    });
  });

  app.post("/todos", (req, res) => {
    const input = TodoInput.safeParse(req.body);
    return makeEndpoint(input, res, (input) => createTodo(input.title));
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

  app.put("/todos/:id/mark-completed", (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);
    return makeEndpoint(id, res, markTodoCompleted);
  });

  app.put("/todos/:id/mark-uncompleted", (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);
    return makeEndpoint(id, res, markTodoUncompleted);
  });

  app.delete("/todos/:id", (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);
    return makeEndpoint(id, res, deleteTodo);
  });

  app.listen(5000, () => console.log("Server ready at port 5000"));
})();
