const router = require("express").Router();

import chefsData from "../store/chefs.js";

router.route("/").get((req, res) => {
  let data = chefsData.chefs;
  res.send(data);
});

router.route("/").post((req, res) => {
  let doc = req.body;
  console.log(doc);

  chefsData.chefs.push(doc);

  res.json({ status: "ok" });
});

router.route("/:recipe").get((req, res) => {
  let recipe = req.params.recipe;
  res.send(
    chefsData.chefs.filter((chef) =>
      chef.recipe.some((r) => r.recipeName === recipe)
    )
  );
});

module.exports = router;
