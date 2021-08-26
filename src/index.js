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

// register
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

// login
app.post("/login", async (req, res) => {
  try {
    const user = req.body;
    const result = await auth.login(user.email, user.password);
    res.json(result);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
});

// update password
app.patch("/update-password", [auth.verify], async (req, res) => {
  const changes = req.body;

  const email = req.user.email;

  if (changes.new_password && changes.old_password) {
    const result = await auth.changeUserPassword(
      email,
      changes.old_password,
      changes.new_password
    );
    if (result) {
      res.status(201).json({
        message: "Successfully updated password!",
      }); //ako je status 201 ne moram vracat poruku
    } else {
      res.status(500).json({ errror: "Cannot change password" }); //ako je status 500, znaci da je greska do servera
    }
  } else {
    res.status(400).json({ error: "Krivi upit" }); //status 400 znaci da je korisnik poslao lose definiran upit
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

initDB()
  .then((db) => {
    console.log("Successfully Connected MongoDB!!");
    app.listen(PORT, () => console.log(`Server is on port: ${PORT}`));
  })
  .catch((err) => {
    console.log(`checking connection error: `, err);
  });
