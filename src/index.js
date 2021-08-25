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

app.get("/recipes", (req, res) => {
  {
    let title = req.query.title;
    console.log("Pretraga", title);
    let recepti = store.recipes;

    res.json(recepti);
  }
});

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

//za password change
app.patch("/users", [auth.verify], async (req, res) => {
  let changes = req.body;

  let username = req.jwt.username;

  if (changes.new_password && changes.old_password) {
    let result = await auth.changeUserPassword(
      username,
      changes.old_password,
      changes.new_password
    );
    if (result) {
      res.status(201).send(); //ako je status 201 ne moram vracat poruku
    } else {
      res.status(500).json({ errror: "Cannot change password" }); //ako je status 500, znaci da je greska do servera
    }
  } else {
    res.status(400).json({ error: "Krivi upit" }); //status 400 znaci da je korisnik poslao lose definiran upit
  }
});
