require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const assert = require("assert");
const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.SQL_CONNECTION_STRING;
assert.ok(
  connectionString,
  "you must define a SQL_CONNECTION_STRING in the environment or the app won't start"
);

async function init() {
  const client = new CosmosClient(connectionString);

  const app = express();
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/get", async (req, res) => {
    const db = await client.database("app");
    const container = db.container("notes");

    const querySpec = {
      query: "SELECT * from c",
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    const notes = resources.map(({ text }) => text);

    res.json({ status: "ok", notes }).end();
  });

  app.post("/add", async (req, res) => {
    const db = await client.database("app");
    const container = db.container("notes");

    await container.items.create({
      text: req.body.text,
    });

    const querySpec = {
      query: "SELECT * from c",
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    const notes = resources.map(({ text }) => text);

    res.json({ status: "ok", notes }).end();
  });

  const PORT = process.env.PORT || 3001;
  app.use(express.static("./build"));
  app.listen(PORT);

  console.log(`running on http://localhost:${PORT}`);
}
init();
