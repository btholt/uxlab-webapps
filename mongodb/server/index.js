require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { MongoClient } = require("mongodb");

const connectionString =
  process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";

async function init() {
  const client = new MongoClient(connectionString, {
    useUnifiedTopology: true,
  });
  await client.connect();

  const app = express();
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/get", async (req, res) => {
    const db = await client.db("app");
    const collection = db.collection("notes");

    const notesObj = await collection.find({}, { _id: 0 }).toArray();
    const notes = notesObj.map(({ text }) => text);

    res.json({ status: "ok", notes }).end();
  });

  app.post("/add", async (req, res) => {
    const db = await client.db("app");
    const collection = db.collection("notes");

    await collection.insertOne({
      text: req.body.text,
    });

    const notesObj = await collection.find({}, { _id: 0 }).toArray();
    const notes = notesObj.map(({ text }) => text);

    res.json({ status: "ok", notes }).end();
  });

  const PORT = process.env.PORT || 3001;
  app.use(express.static("./build"));
  app.listen(PORT);

  console.log(`running on http://localhost:${PORT}`);
}
init();
