document.addEventListener('DOMContentLoaded', () => {
    const fetchRecipesButton = document.getElementById('fetchRecipes');
    const recipesContainer = document.getElementById('recipes-container');
    const loadingIndicator = document.getElementById('loading');
    
    // API URL - Update this with your actual API URL
    const apiUrl = 'http://127.0.0.1:8000/recipes';
    
    fetchRecipesButton.addEventListener('click', async () => {
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        
        // Clear previous recipes
        recipesContainer.innerHTML = '';
        
        try {
            // Fetch recipes from API
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const recipes = await response.json();
            
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Display recipes
            displayRecipes(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Show error message
            recipesContainer.innerHTML = `
                <div style="text-align: center; color: #e53e3e; grid-column: 1 / -1;">
                    <p>Failed to fetch recipes. Please try again later.</p>
                </div>
            `;
        }
    });
    
    function displayRecipes(recipes) {
        if (recipes.length === 0) {
            recipesContainer.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1;">
                    <p>No recipes found.</p>
                </div>
            `;
            return;
        }
        
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            // Create ingredients list
            let ingredientsList = '';
            recipe.ingredients.forEach(ingredient => {
                ingredientsList += `<li>${ingredient}</li>`;
            });
            
            recipeCard.innerHTML = `
                <div class="recipe-info">
                    <h2 class="recipe-title">${recipe.title}</h2>
                    <span class="recipe-difficulty">${recipe.difficulty}</span>
                    <p class="recipe-pasta-type">Pasta: ${recipe.pasta_type}</p>
                    <h3 class="ingredients-title">Ingredients:</h3>
                    <ul class="ingredients-list">
                        ${ingredientsList}
                    </ul>
                    <a href="${recipe.recipe_url}" target="_blank" class="recipe-link">View Full Recipe</a>
                </div>
            `;
            
            // If image is available, add it
            if (recipe.image_url) {
                const imageDiv = document.createElement('div');
                imageDiv.innerHTML = `<img src="${recipe.image_url}" alt="${recipe.title}" class="recipe-image">`;
                recipeCard.insertBefore(imageDiv, recipeCard.firstChild);
            }
            
            recipesContainer.appendChild(recipeCard);
        });
    }
});