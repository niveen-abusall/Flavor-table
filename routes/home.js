// routes/home.js
const express = require("express");
const router = express.Router();
const path = require("path");
const axios = require("axios"); 
const { Pool } = require('pg');

const API_KEY = process.env.SPOONACULAR_API_KEY;

// -------------------- SERVE HOME PAGE --------------------
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// -------------------- SEARCH RECIPES BY INGREDIENTS --------------------
router.get("/search", async (req, res) => {
  const ingredientsQuery = req.query.ingredients;

  if (!ingredientsQuery) {
    return res.status(400).json({
      error: "Missing 'ingredients' query parameter (e.g., ?ingredients=apple,sugar)."
    });
  }

  try {
    // Step 1: Search recipes by ingredients
    const response = await axios.get("https://api.spoonacular.com/recipes/findByIngredients", {
      params: {
        ingredients: ingredientsQuery,
        number: 6,
        ranking: 1,
        ignorePantry: false,
        apiKey: API_KEY
      }
    });

    const data = response.data;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No recipes found for the given ingredients." });
    }

    // Step 2: Fetch detailed info for each recipe
    const detailedRecipes = await Promise.all(
      data.map(async (recipe) => {
        try {
          const detailRes = await axios.get(
            `https://api.spoonacular.com/recipes/${recipe.id}/information`,
            { params: { apiKey: API_KEY } }
          );

          const details = detailRes.data;

          return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            instructions: details.instructions || "No instructions available",
            readyIn: details.readyInMinutes || null,
            ingredients: details.extendedIngredients.map(ing => ing.original)
          };
        } catch (err) {
          console.error(`Error fetching details for recipe ID ${recipe.id}:`, err.message);
          return null;
        }
      })
    );

    const filteredRecipes = detailedRecipes.filter(r => r !== null);
    res.json(filteredRecipes);

  } catch (error) {
    console.error("Error fetching recipes by ingredients:", error.message);
    if (error.response) {
      console.error("Spoonacular API Error Status:", error.response.status);
      console.error("Spoonacular API Error Data:", error.response.data);
    }
    res.status(500).json({ error: "Failed to fetch recipes by ingredients from external API." });
  }
});

// -------------------- POSTGRES FAVORITES --------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all favorites
router.get("/recipes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add recipe to favorites
router.post("/recipes", async (req, res) => {
  try {
    const { title, image, instructions, ingredients, readyIn } = req.body;

    const result = await pool.query(
      `INSERT INTO recipes (title, image, instructions, ingredients, readyIn)
       VALUES ($1, $2, $3, $4::jsonb, $5)
       RETURNING *`,
      [title, image, instructions, JSON.stringify(ingredients), readyIn]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove recipe from favorites
router.delete("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM recipes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
