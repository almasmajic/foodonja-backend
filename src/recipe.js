import { RecipeCollection } from "./db.js";

export default {
  async addRecipe(recipeData, userData) {
    const recipeDoc = {
      image: recipeData.image,
      name: recipeData.name,
      ingredients: recipeData.ingredients,
      how_to: recipeData.how_to,
      prep_time: recipeData.prep_time,
      category: recipeData.category,
      postedBy: userData,
    };
    try {
      let result = await RecipeCollection.insertOne(recipeDoc);
      if (result && result.insertedId) {
        return result.insertedId;
      }
    } catch (e) {
      if ((e.name == "MongoError" && e.code == 11000) || []) {
        throw new Error("Something went wrong while adding recipe!");
      }
    }
  },
  async getAndSearchRecipe(searchQuery) {
    try {
      const result = await RecipeCollection.find(searchQuery).toArray();
      return result;
    } catch (e) {
      if ((e.name == "MongoError" && e.code == 11000) || []) {
        throw new Error("Something went wrong while adding recipe!");
      }
    }
  },
};
