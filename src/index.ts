import express from "express";
import meta from "../package.json";

const app = express();

app.get("/", (_req, res) => {
  res.json({
    name: meta.name,
    version: meta.version,
  });
});

app.listen(5000, () => console.log("Server ready at port 5000"));
