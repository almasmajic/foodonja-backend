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

  async login(email, password) {
    const userDoc = await UserCollection.findOne({ email: email });

    if (
      userDoc &&
      userDoc.password &&
      (await bcrypt.compare(password, userDoc.password))
    ) {
      delete userDoc.password;
      let token = jwt.sign(userDoc, process.env.JWT_SECRET, {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
      return {
        token,
        email: userDoc.email,
      };
    } else {
      throw new Error("Nista od prijave");
    }
  },

  verify(req, res, next) {
    //checking if Authorization is set or not
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }

    //spiliting Authorization then escape Bearer and send token in token variable
    const token = authHeader.split(" ")[1];

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }

    if (!decodedToken) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }

    //seperating variables to use in next functions
    req.user = {
      _id: decodedToken._id,
      email: decodedToken.email,
      username: decodedToken.username,
    };
    // calling next function
    next();
  },

  //password change
  async changeUserPassword(email, old_password, new_password) {
    let userDoc = await UserCollection.findOne({ email: email }); //provjerava imamo li korisnika u bazi s tim usernameom

    if (
      userDoc &&
      userDoc.password &&
      (await bcrypt.compare(old_password, userDoc.password))
    ) {
      let new_password_hashed = await bcrypt.hash(new_password, 12);

      let result = await UserCollection.updateOne(
        { _id: userDoc._id },
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
