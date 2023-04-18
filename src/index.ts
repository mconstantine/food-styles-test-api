import * as dotenv from "dotenv";
dotenv.config();

import express, { Router } from "express";
import meta from "../package.json";
import { withDatabase } from "./withDatabase";
import { TodoInput } from "./todo/model";
import { createTodo } from "./todo/createTodo";
import z from "zod";
import { markTodoCompleted } from "./todo/markTodoCompleted";
import { markTodoUncompleted } from "./todo/markTodoUncompleted";
import { deleteTodo } from "./todo/deleteTodo";
import { ListTodosFilter, listTodos } from "./todo/listTodos";
import { makeEndpoint } from "./utils/makeEndpoint";
import cors from "cors";
import { authMiddleware } from "./utils/authMiddleware";
import {
  RefreshTokenInput,
  UserInput,
  UserLoginInput,
  refreshToken,
} from "./user/model";
import { signUpUser } from "./user/signUpUser";
import { loginUser } from "./user/loginUser";

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

  app.post("/users/signup", (req, res) => {
    const input = UserInput.safeParse(req.body);

    return makeEndpoint(input, res, (input) =>
      signUpUser(input.name, input.email, input.password)
    );
  });

  app.post("/users/login", (req, res) => {
    const input = UserLoginInput.safeParse(req.body);

    return makeEndpoint(input, res, (input) =>
      loginUser(input.email, input.password)
    );
  });

  app.post("/users/refresh-token", (req, res) => {
    const input = RefreshTokenInput.safeParse(req.body);

    return makeEndpoint(input, res, (input) =>
      refreshToken(input.refreshToken)
    );
  });

  const todosRouter = Router();
  todosRouter.use(authMiddleware);

  todosRouter.post("/", (req, res) => {
    const input = TodoInput.safeParse(req.body);
    return makeEndpoint(input, res, (input) => createTodo(input.title));
  });

  todosRouter.get("/", async (req, res) => {
    const input = ListTodosFilter.safeParse(req.query);
    return makeEndpoint(input, res, (input) => listTodos(input.filter));
  });

  todosRouter.put("/:id/mark-completed", (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);
    return makeEndpoint(id, res, markTodoCompleted);
  });

  todosRouter.put("/:id/mark-uncompleted", (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);
    return makeEndpoint(id, res, markTodoUncompleted);
  });

  todosRouter.delete("/:id", (req, res) => {
    const id = z.coerce.number().int().min(1).safeParse(req.params.id);
    return makeEndpoint(id, res, deleteTodo);
  });

  app.use("/todos", todosRouter);
  app.listen(5000, () => console.log("Server ready at port 5000"));
})();
