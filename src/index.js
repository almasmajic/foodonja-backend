import dotenv from "dotenv";
dotenv.config();

import connect from "./db.js";
import express from "express";
import mongo from "mongodb";
import cors from "cors";
import auth from "./auth.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.listen(port, () => console.log(`Server is on port: ${port}`));

app.post("/users", async (req, res) => {
  let user = req.body;
  let id;

  try {
    id = await auth.registerUser(user);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
  return res.json({ id: id });
});

app.post("/auth", async (req, res) => {
  let user = req.body;

  try {
    let result = await auth.authUser(user.email, user.password);
    res.json(result);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
});

app.get("/filters", async (req, res) => {
  let db = await connect();

  let cursor = await db.collection("filters").find();
  let result = await cursor.toArray();

  res.json(result);
});
