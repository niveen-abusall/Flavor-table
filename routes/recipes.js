const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = process.env.SPOONACULAR_API_KEY;

// Random recipe endpoint
router.get("/recipes/random", async (req, res) => {
  try {
    // Step 1: Get one random recipe from complexSearch
    const searchRes = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=1&sort=random`
    );

    const recipeId = searchRes.data.results[0].id;

    // Step 2: Get detailed recipe info
    const detailRes = await axios.get(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
    );

    const recipe = detailRes.data;

    // Step 3: Simplify response
    const simplifiedRecipe = {
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions,
      ingredients: recipe.extendedIngredients.map(ing => ing.original)
    };

    res.json(simplifiedRecipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});






// GET /recipes/search - Searches recipes by ingredients and returns JSON

router.get("/search", async (req, res) => {
  const ingredientsQuery = req.query.ingredients; // Get comma-separated ingredients from URL query

  if (!ingredientsQuery) {
    return res.status(400).json({ error: "Missing 'ingredients' query parameter (e.g., ?ingredients=apple,sugar)." });
  }

  const apiUrl = "https://api.spoonacular.com/recipes/findByIngredients";

  try {
    const response = await axios.get(apiUrl, {
      params: {
        ingredients: ingredientsQuery, // Pass the query directly to Spoonacular
        number: 5, // You can adjust how many results you want to fetch
        ranking: 1, // Maximize used ingredients
        ignorePantry: false, // Don't ignore typical pantry items in the ingredient search
        apiKey: API_KEY
      }
    });

    const data = response.data; // Axios automatically parses JSON

    if (data && data.length > 0) {
      // Simplify the response to the required fields: title, image, usedIngredients, missedIngredients
      const simplifiedRecipes = data.map(recipe => ({
        title: recipe.title,
        image: recipe.image,
        usedIngredients: recipe.usedIngredients.map(ing => ing.original),
        missedIngredients: recipe.missedIngredients.map(ing => ing.original),
      }));
      res.json(simplifiedRecipes); // Return the simplified JSON array
    } else {
      res.status(404).json({ message: 'No recipes found for the given ingredients.' });
    }

  } catch (error) {
    console.error('Error fetching recipes by ingredients from Spoonacular API:', error);
    if (error.response) {
      console.error('Spoonacular API Error Status:', error.response.status);
      console.error('Spoonacular API Error Data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch recipes by ingredients from external API.' });
  }
});




module.exports = router;