import dotenv from "dotenv";
dotenv.config();

import { initDB } from "./db.js";
import express from "express";
import cors from "cors";
import auth from "./auth.js";

const app = express();
const PORT = process.env.PORT | 3000;

app.use(cors());
app.use(express.json());

// api's will be places in the sequence of flow.
// first will be register api and it's name should be register
app.put("/register", async (req, res) => {
  try {
    const user = req.body;
    const id = await auth.registerUser(user);
    return res.json({ message: "Successfully registered user!", id: id });
  } catch (e) {
    console.log("checking register error: ", e);
    return res.status(500).json({ error: e.message });
  }
});

app.get("/recipes", (req, res) => {
  {
    let title = req.query.title;
    console.log("Pretraga", title);
    let recepti = store.recipes;

    res.json(recepti);
  }
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

//za password change
app.post("/upload", [auth.verify], async (req, res) => {
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

// MongoDb should be connected before application listening
// This connection and listening should be down of the page
initDB()
  .then((db) => {
    console.log("Successfully Connected MongoDB!!");
    app.listen(PORT, () => console.log(`Server is on port: ${PORT}`));
  })
  .catch((err) => {
    console.log(`checking connection error: `, err);
  });
