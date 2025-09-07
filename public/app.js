document.addEventListener('DOMContentLoaded', () => {
  const getRandomRecipeBtn = document.getElementById('get-random-recipe-btn');
  const recipeDisplayArea = document.getElementById('recipe-display-area');

  if (getRandomRecipeBtn) {
    getRandomRecipeBtn.addEventListener('click', fetchRandomRecipe);
  }

  // Initial fetch when the page loads
  fetchRandomRecipe();

  async function fetchRandomRecipe() {
    recipeDisplayArea.innerHTML = '<h2>Loading a delicious recipe...</h2>';

    try {
      const response = await fetch('/api/random-recipe'); // ✅ match server.js endpoint

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const recipe = await response.json();
      displayRecipe(recipe);

    } catch (error) {
      console.error('Error fetching random recipe:', error);
      recipeDisplayArea.innerHTML = '<h2>Failed to load a recipe. Please try again.</h2>';
    }
  }

  function displayRecipe(recipe) {
    if (!recipe) {
      recipeDisplayArea.innerHTML = '<h2>No recipe found.</h2>';
      return;
    }

    const ingredientsList = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');

    recipeDisplayArea.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 100%; height: auto;">
      <h3>Instructions:</h3>
      <p>${recipe.instructions}</p>
      <h3>Ingredients:</h3>
      <ul>${ingredientsList}</ul>
    `;
  }
});



//Favorite recipes

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("favorites-container");
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    container.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  favorites.forEach((recipe, index) => {
    const card = document.createElement("div");
    card.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}" style="max-width:200px">
      <button data-index="${index}">Remove</button>
    `;
    container.appendChild(card);
  });

  // Handle remove
  container.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const i = e.target.getAttribute("data-index");
      favorites.splice(i, 1);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      location.reload(); // refresh page
    }
  });
});
