import mongo from "mongodb";

const CONNECTION_URL =
  "mongodb+srv://admin:admin@foodonja.xuixn.mongodb.net/foodonja?retryWrites=true&w=majority";

let client = new mongo.MongoClient(CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;
let UserCollection = null;
let RecipeCollection = null;

export const initDB = () => {
  return new Promise(async (resolve, reject) => {
    if (db && client) {
      resolve(db);
    }

    client.connect((err) => {
      if (err) {
        reject("Doslo je do greske " + err);
      } else {
        db = client.db("foodonja");
        setupUserCollection();
        setupRecipeCollection();
        resolve(db);
      }
    });
  });
};

export const setupUserCollection = () => {
  UserCollection = db.collection("users");
  UserCollection.createIndex({ email: 1 }, { unique: true });
};

export const setupRecipeCollection = () => {
  RecipeCollection = db.collection("recipes");
};

export { db, UserCollection, RecipeCollection };
