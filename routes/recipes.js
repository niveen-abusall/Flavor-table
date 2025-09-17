const express = require("express");
const axios = require("axios");
const router = express.Router();
const { Pool } = require('pg');

const API_KEY = process.env.SPOONACULAR_API_KEY;

// -------------------- RANDOM RECIPE --------------------
router.get("/recipes/random", async (req, res) => {
  try {
    const searchRes = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=1&sort=random`
    );

    const recipeId = searchRes.data.results[0].id;

    const detailRes = await axios.get(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
    );

    const recipe = detailRes.data;

    const simplifiedRecipe = {
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions || "No instructions available",
      readyIn: recipe.readyInMinutes || null,
      ingredients: recipe.extendedIngredients.map(ing => ing.original)
    };

    res.json(simplifiedRecipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});




module.exports = router;

