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



/*//Favorite recipes

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
});*/

// Add recipe to favorites
async function addToFavorites(recipe) {
  try {
    const response = await fetch("http://localhost:3000/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe),
    });
    if (response.ok) {
      alert("✅ Recipe added to favorites!");
    }
  } catch (err) {
    console.error("Error adding to favorites:", err);
  }
}

// Remove recipe from favorites
async function removeFavorite(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      document.querySelector(`.recipe-card[data-id="${id}"]`)?.remove();
    } else {
      console.error("Failed to remove favorite");
    }
  } catch (err) {
    console.error("Error removing favorite:", err);
  }
}

// Update recipe in favorites
async function updateFavorite(id, updatedData) {
  try {
    const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      alert("✏️ Recipe updated successfully!");
      loadFavorites(); // reload list to show updated recipe
    } else {
      console.error("Failed to update recipe");
    }
  } catch (err) {
    console.error("Error updating recipe:", err);
  }
}

// Load favorites and render them
async function loadFavorites() {
  try {
    const response = await fetch("http://localhost:3000/api/recipes");
    const favorites = await response.json();

    const container = document.getElementById("favorites-container");
    container.innerHTML = "";

    if (favorites.length === 0) {
      container.innerHTML = "<p>No favorites yet.</p>";
      return;
    }

    favorites.forEach((recipe) => {
      const card = document.createElement("div");
      card.classList.add("recipe-card");
      card.setAttribute("data-id", recipe.id);

      card.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}" />
        <p>${recipe.instructions || "No instructions available"}</p>
        <p><strong>Ingredients:</strong> ${(recipe.ingredients || []).join(", ")}</p>
        <button class="remove-btn">⛔ Remove</button>
        <button class="update-btn">✏️ Update</button>
      `;

      // Hook remove button
      const removeBtn = card.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => removeFavorite(recipe.id));

      // Hook update button
      const updateBtn = card.querySelector(".update-btn");
      updateBtn.addEventListener("click", () => {
        const newTitle = prompt("Enter new title:", recipe.title);
        const newInstructions = prompt("Enter new instructions:", recipe.instructions);
        const newIngredients = prompt("Enter ingredients (comma-separated):", recipe.ingredients?.join(", "));

        if (newTitle || newInstructions || newIngredients) {
          const updatedData = {
            title: newTitle || recipe.title,
            instructions: newInstructions || recipe.instructions,
            ingredients: newIngredients ? newIngredients.split(",").map(i => i.trim()) : recipe.ingredients,
            image: recipe.image, 
          };

          updateFavorite(recipe.id, updatedData);
        }
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading favorites:", err);
  }
}
