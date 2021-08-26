import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserCollection } from "./db.js";

export default {
  async registerUser(userData) {
    const userDoc = await UserCollection.findOne({ email: userData.email });
    if (userDoc) {
      throw new Error("user with this E-Mail address already exists!");
    }
    const doc = {
      username: userData.username,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 12),
    };
    try {
      let result = await UserCollection.insertOne(doc);
      if (result && result.insertedId) {
        return result.insertedId;
      }
    } catch (e) {
      if ((e.name == "MongoError" && e.code == 11000) || []) {
        throw new Error("Korisnik vec postoji");
      }
    }
  },

  async authUser(email, password) {
    let user = await UserCollection.findOne({ email: email });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      delete user.password;
      let token = jwt.sign(user, process.env.JWT_SECRET, {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
      return {
        token,
        email: user.email,
      };
    } else {
      throw new Error("Nista od prijave");
    }
  },

  verify(req, res, next) {
    try {
      let authorization = req.headers.authorization.split(" ");
      let type = authorization[0];
      let token = authorization[1];

      if (type !== "Bearer") {
        res.status(401).send();
        return false;
      } else {
        req.jwt = jwt.verify(token, process.env.JWT_SECRET);
        return next();
      }
    } catch (e) {
      return res.status(401).send();
    }
  },

  //password change
  async changeUserPassword(username, old_password, new_password) {
    let user = await UserCollection.findOne({ username: username }); //provjerava imamo li korisnika u bazi s tim usernameom

    if (
      user &&
      user.password &&
      (await bcrypt.compare(old_password, user.password))
    ) {
      let new_password_hashed = await bcrypt.hash(new_password, 8);

      let result = await UserCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: new_password_hashed,
          },
        }
      );
      return result.modifiedCount == 1;
    }
  },
};
