require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

const homeRoutes = require("./routes/home");
const recipesRoutes = require("./routes/recipes");

app.use(cors());
app.use(express.static("public"));

// Mount routes
app.use("/home", homeRoutes);
app.use("/api", recipesRoutes);

// Direct endpoint for random recipe
app.get('/api/random-recipe', async (req, res) => {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured.' });
  }

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/random', {
      params: {
        number: 1,
        addRecipeInformation: true,
        apiKey
      }
    });

    const data = response.data;

    if (data && data.recipes && data.recipes.length > 0) {
      const recipe = data.recipes[0];
      const simplifiedRecipe = {
        title: recipe.title,
        image: recipe.image,
        instructions: recipe.instructions || 'No instructions available.',
        ingredients: recipe.extendedIngredients ? recipe.extendedIngredients.map(ing => ing.original) : [],
      };
      res.json(simplifiedRecipe);
    } else {
      res.status(404).json({ message: 'No random recipe found.' });
    }
  } catch (error) {
    console.error('Error fetching recipe:', error.message);
    res.status(500).json({ error: 'Failed to fetch recipe.' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});







