import express from "express";
import meta from "../package.json";
import { withDatabase } from "./withDatabase";

const app = express();

(async () => {
  await withDatabase(() => Promise.resolve());

  app.get("/", (_req, res) => {
    res.json({
      name: meta.name,
      version: meta.version,
    });
  });

  app.listen(5000, () => console.log("Server ready at port 5000"));
})();
