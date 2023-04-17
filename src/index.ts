import express from "express";
import meta from "../package.json";
import { withDatabase } from "./withDatabase";
import { TodoInput } from "./todo/model";
import { createTodo } from "./todo/createTodo";

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
    const data = TodoInput.safeParse(req.body);

    if (data.success) {
      try {
        const todo = await createTodo(data.data.title);
        return res.json(todo);
      } catch (e) {
        console.log(e);
        return res.status(500).end();
      }
    } else {
      return res.status(422).json(data.error);
    }
  });

  app.listen(5000, () => console.log("Server ready at port 5000"));
})();
