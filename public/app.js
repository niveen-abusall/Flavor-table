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


// ------------------- Favorites CRUD -------------------

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
      loadFavorites();
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
    if (!response.ok) throw new Error("Failed to update recipe");
    return await response.json();
  } catch (err) {
    console.error("Error updating recipe:", err);
    throw err;
  }
}

// ------------------- Load Favorites -------------------

async function loadFavorites() {
  try {
    const response = await fetch("http://localhost:3000/api/recipes");
    const favorites = await response.json();

    const container = document.getElementById("favorites-container");
    container.innerHTML = "";

    if (!favorites || favorites.length === 0) {
      container.innerHTML = "<p>No favorites yet.</p>";
      return;
    }

    favorites.forEach((recipe) => {
      const card = document.createElement("div");
      card.classList.add("recipe-card");
      card.setAttribute("data-id", recipe.id);

      card.innerHTML = `
        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">` : ""}
        <h3 class="recipe-title">${recipe.title}</h3>
        <p class="recipe-ingredients"><strong>Ingredients:</strong> ${(recipe.ingredients || []).join(", ")}</p>
        <button class="update-btn">✏️ Update</button>
        <button class="remove-btn">⛔ Remove</button>
      `;

      // Remove button
      card.querySelector(".remove-btn").addEventListener("click", () => removeFavorite(recipe.id));

      // Update button opens modal
      card.querySelector(".update-btn").addEventListener("click", () => openUpdateForm(recipe, card));

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading favorites:", err);
  }
}

// ------------------- Modal Update Form -------------------

const updateForm = document.getElementById("updateForm");
const updateRecipeForm = document.getElementById("updateRecipeForm");
const updateTitle = document.getElementById("updateTitle");

const cancelUpdate = document.getElementById("cancelUpdate");

let currentRecipeId = null;
let currentCard = null;

// Open modal with current recipe
function openUpdateForm(recipe, card) {
  currentRecipeId = recipe.id;
  currentCard = card;
  updateTitle.value = recipe.title;

  updateForm.style.display = "flex"; // show modal
}

// Close modal
function closeUpdateModal() {
  updateForm.style.display = "none";
  currentRecipeId = null;
  currentCard = null;
}

cancelUpdate.addEventListener("click", closeUpdateModal);
window.addEventListener("click", (e) => {
  if (e.target === updateForm) closeUpdateModal();
});

// Submit updated recipe
updateRecipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentRecipeId) return;

  const updatedData = {
    title: updateTitle.value,
 
    
  };

  try {
    const updatedRecipe = await updateFavorite(currentRecipeId, updatedData);
    alert("✅ Recipe updated!");

    // Update card DOM
    currentCard.querySelector(".recipe-title").textContent = updatedRecipe.title;
   
  } catch (err) {
    alert("❌ Error updating recipe");
  }

  closeUpdateModal();
});

// ------------------- Initial Load -------------------

loadFavorites();

