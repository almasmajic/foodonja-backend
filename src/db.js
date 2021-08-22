import mongo from "mongodb";

let connection_string =
  "mongodb+srv://admin:admin@foodonja.xuixn.mongodb.net/foodonja?retryWrites=true&w=majority";

let client = new mongo.MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;

export default () => {
  return new Promise(async (resolve, reject) => {
    if (db && client) {
      resolve(db);
    }

    client.connect((err) => {
      if (err) {
        reject("Doslo je do greske " + err);
      } else {
        console.log("Uspijesno spajanje na bazu");
        db = client.db("foodonja");
        //console.log(db);
        resolve(db);
      }
    });
  });
};
