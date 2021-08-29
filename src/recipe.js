import { RecipeCollection } from "./db.js";
import mongodb from "mongodb";

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
  async getSingleRecipe(_id) {
    try {
      const result = await RecipeCollection.findOne({
        _id: mongodb.ObjectId(_id),
      });
      return result;
    } catch (e) {
      if ((e.name == "MongoError" && e.code == 11000) || []) {
        throw new Error("Something went wrong while adding recipe!");
      }
    }
  },
  async deleteRecipe(_id, userId) {
    try {
      const result = await RecipeCollection.deleteOne({
        _id: mongodb.ObjectId(_id),
        "postedBy._id": userId,
      });
      return result.deletedCount > 0;
    } catch (e) {
      if ((e.name == "MongoError" && e.code == 11000) || []) {
        throw new Error("Something went wrong while adding recipe!");
      }
    }
  },
  async updateRecipe(recipeData, userId) {
    try {
      const recipeDoc = await RecipeCollection.findOne({
        _id: mongodb.ObjectId(recipeData._id),
      });

      if (!recipeDoc) throw new Error("Recipe not found!");
      if (recipeDoc.postedBy._id !== userId)
        throw new Error(
          "You don't have enough permissions to update this recipe!"
        );
      const updatedRecipe = {};
      if (recipeData.image && recipeData.image !== "")
        updatedRecipe["image"] = recipeData.image;
      if (recipeData.name && recipeData.name !== "")
        updatedRecipe["name"] = recipeData.name;
      if (recipeData.ingredients && recipeData.ingredients.length > 0)
        updatedRecipe["ingredients"] = recipeData.ingredients;
      if (recipeData.how_to && recipeData.how_to !== "")
        updatedRecipe["how_to"] = recipeData.how_to;
      if (recipeData.prep_time && recipeData.prep_time !== "")
        updatedRecipe["prep_time"] = recipeData.prep_time;
      if (recipeData.category && recipeData.category !== "")
        updatedRecipe["category"] = recipeData.category;

      const result = await RecipeCollection.updateOne(
        { _id: recipeDoc._id },
        {
          $set: {
            ...updatedRecipe,
          },
        }
      );
      return result.modifiedCount == 1;
    } catch (e) {
      throw new Error(e);
    }
  },
  async favoriteRecipe(_id, userData) {
    try {
      const recipeDoc = await RecipeCollection.findOne({
        _id: mongodb.ObjectId(_id),
      });
      if (!recipeDoc) throw new Error("Recipe not found!");
      if (recipeDoc.userId === userData._id)
        throw new Error("You can't favorite your own recipe!");
      let favorites = recipeDoc.favorites;
      if (!favorites) {
        favorites = [];
        favorites.push(userData);
      }
      const index = favorites.findIndex((fav) => fav._id === userData._id);
      if (index < 0) favorites.push(userData);
      const result = await RecipeCollection.updateOne(
        { _id: recipeDoc._id },
        {
          $set: {
            favorites: favorites,
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (e) {
      throw new Error(e);
    }
  },
  async deleteFavoriteRecipe(_id, userId) {
    try {
      const recipeDoc = await RecipeCollection.findOne({
        _id: mongodb.ObjectId(_id),
      });
      if (!recipeDoc) throw new Error("Recipe not found!");
      if (recipeDoc.userId === userId)
        throw new Error("You can't favorite your own recipe!");
      let updatedData = {};
      if (!recipeDoc.favorites) throw new Error("favorites not found!");
      updatedData["favorites"] = recipeDoc.favorites.filter(
        (fav) => fav._id !== userId
      );

      if (updatedData.favorites.length === recipeDoc.favorites) {
        updatedData = {};
      }
      const result = await RecipeCollection.updateOne(
        { _id: recipeDoc._id },
        {
          $set: {
            ...updatedData,
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (e) {
      throw new Error(e);
    }
  },
  async addRating(_id, rating, userData) {
    try {
      const recipeDoc = await RecipeCollection.findOne({
        _id: mongodb.ObjectId(_id),
      });
      if (!recipeDoc) throw new Error("Recipe not found!");
      if (recipeDoc.userId === userData._id)
        throw new Error("You can't add rating your own recipe!");
      let updatedData = {
        ratingData: recipeDoc.ratingData,
        rating: recipeDoc.rating,
      };
      if (!updatedData.ratingData) updatedData["ratingData"] = [];
      const index = updatedData.ratingData.findIndex(
        (rat) => rat._id === userData._id
      );
      if (index && index > -1) throw new Error("Rating already added!");
      updatedData.ratingData.push({
        ...userData,
        rating,
      });
      if (typeof rating !== "number" || rating > 5)
        throw new Error("Invalid rating Value!");
      if (!updatedData.rating) updatedData["rating"] = rating;
      else {
        let totalRating = 0;
        updatedData.ratingData.forEach((element) => {
          totalRating += element.rating;
        });
        updatedData["rating"] = totalRating / updatedData.ratingData.length;
      }

      const result = await RecipeCollection.updateOne(
        { _id: recipeDoc._id },
        {
          $set: {
            ...updatedData,
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (e) {
      throw new Error(e);
    }
  },
  async removeRating(_id, userId) {
    try {
      const recipeDoc = await RecipeCollection.findOne({
        _id: mongodb.ObjectId(_id),
      });
      if (!recipeDoc) throw new Error("Recipe not found!");
      if (recipeDoc.userId === userId)
        throw new Error("You can't add or remove rating your own recipe!");
      let updatedData = {
        ratingData: recipeDoc.ratingData,
        rating: recipeDoc.rating,
      };
      if (!updatedData.ratingData) throw new Error("Rating not found!");
      const index = updatedData.ratingData.findIndex(
        (rat) => rat._id === userId
      );
      if (index && index < 0) throw new Error("You didn't add rating!");
      updatedData.ratingData = updatedData.ratingData.splice(index, 1);
      let totalRating = 0;
      updatedData.ratingData.forEach((element) => {
        totalRating += element.rating;
      });
      updatedData["rating"] = totalRating / updatedData.ratingData.length;
      const result = await RecipeCollection.updateOne(
        { _id: recipeDoc._id },
        {
          $set: {
            ...updatedData,
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (e) {
      throw new Error(e);
    }
  },
};
