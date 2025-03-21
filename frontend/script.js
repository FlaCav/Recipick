document.addEventListener('DOMContentLoaded', () => {
    const fetchRecipesButton = document.getElementById('fetchRecipes');
    const searchButton = document.getElementById('searchButton');
    const ingredientInput = document.getElementById('ingredientSearch');
    const recipesContainer = document.getElementById('recipes-container');
    const loadingIndicator = document.getElementById('loading');
    const pastaTypesContainer = document.getElementById('pasta-types-container');
    const homeButton = document.getElementById('homeButton');
    
    // API URLs - Update these with your actual API URLs
    const baseApiUrl = 'http://127.0.0.1:8000';
    const recipesUrl = `${baseApiUrl}/recipes`;
    const searchUrl = `${baseApiUrl}/search`;
    const pastaTypeSearchUrl = `${baseApiUrl}/search/`;
    
    // Set page title
    let currentPageTitle = 'All Recipes';
    
    // Load pasta types when page loads
    loadPastaTypes();
    
    // Initialize the page to home state
    resetToHome();
    
    // Event Listeners
    fetchRecipesButton.addEventListener('click', () => {
        hidePastaTypes();
        fetchRecipes();
    });
    
    searchButton.addEventListener('click', () => {
        const ingredient = ingredientInput.value.trim();
        if (ingredient) {
            searchByIngredient(ingredient);
        }
    });
    
    ingredientInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const ingredient = ingredientInput.value.trim();
            if (ingredient) {
                searchByIngredient(ingredient);
            }
        }
    });
    
    homeButton.addEventListener('click', () => {
        resetToHome();
    });
    
    // Function to reset to home state
    function resetToHome() {
        showPastaTypes();
        clearRecipesContainer();
        ingredientInput.value = '';
    }
    
    // Function to fetch and display all recipes
    async function fetchRecipes() {
        showLoading();
        clearRecipesContainer();
        
        try {
            const response = await fetch(recipesUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const recipes = await response.json();
            hideLoading();
            
            currentPageTitle = 'All Recipes';
            displayRecipes(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            hideLoading();
            showError('Failed to fetch recipes. Please try again later.');
        }
    }
    
    // Function to search by ingredient
    async function searchByIngredient(ingredient) {
        showLoading();
        clearRecipesContainer();
        hidePastaTypes(); // Hide pasta types for ingredient search too
        
        try {
            const response = await fetch(`${searchUrl}?ingredient=${encodeURIComponent(ingredient)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const recipes = await response.json();
            hideLoading();
            
            currentPageTitle = `Search results for "${ingredient}"`;
            displayRecipes(recipes, true, { type: 'ingredient', value: ingredient });
        } catch (error) {
            console.error('Error searching recipes:', error);
            hideLoading();
            showError('Failed to search recipes. Please try again later.');
        }
    }
    
    // Function to search by pasta type
    async function searchByPastaType(pastaType) {
        // Hide pasta types immediately before any async operations
        hidePastaTypes();
        
        showLoading();
        clearRecipesContainer();
        
        try {
            const response = await fetch(`${pastaTypeSearchUrl}${encodeURIComponent(pastaType)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const recipes = await response.json();
            hideLoading();
            
            currentPageTitle = `Recipes with ${pastaType}`;
            displayRecipes(recipes, true, { type: 'pastaType', value: pastaType });
        } catch (error) {
            console.error('Error searching recipes by pasta type:', error);
            hideLoading();
            showError('Failed to fetch pasta recipes. Please try again later.');
        }
    }
    
    // Function to load unique pasta types
    async function loadPastaTypes() {
        try {
            const response = await fetch(recipesUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const recipes = await response.json();
            
            // Extract unique pasta types
            const pastaTypes = [...new Set(recipes.map(recipe => recipe.pasta_type))];
            
            // Display pasta type tiles
            displayPastaTypes(pastaTypes);
        } catch (error) {
            console.error('Error loading pasta types:', error);
            pastaTypesContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #e53e3e;">
                    <p>Failed to load pasta types. Please refresh the page.</p>
                </div>
            `;
        }
    }
    
    // Function to display pasta types as tiles
    function displayPastaTypes(pastaTypes) {
        pastaTypesContainer.innerHTML = '';
        
        if (pastaTypes.length === 0) {
            pastaTypesContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center;">
                    <p>No pasta types available.</p>
                </div>
            `;
            return;
        }
        
        pastaTypes.forEach(pastaType => {
            const tile = document.createElement('div');
            tile.className = 'pasta-type-tile';
            tile.innerHTML = `<span class="pasta-type-name">${pastaType}</span>`;
            
            tile.addEventListener('click', () => {
                searchByPastaType(pastaType);
            });
            
            pastaTypesContainer.appendChild(tile);
        });
    }
    
    // Function to hide pasta types - Direct style approach
    function hidePastaTypes() {
        pastaTypesContainer.style.display = 'none';
    }
    
    // Function to show pasta types - Direct style approach
    function showPastaTypes() {
        pastaTypesContainer.style.display = '';
    }
    
    // Function to display recipes
    function displayRecipes(recipes, showSearchInfo = false, searchParams = null) {
        if (recipes.length === 0) {
            recipesContainer.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1;">
                    <p>No recipes found.</p>
                </div>
            `;
            return;
        }
        
        // Add search result info if needed
        if (showSearchInfo && searchParams) {
            const searchInfoDiv = document.createElement('div');
            searchInfoDiv.className = 'search-result-info';
            searchInfoDiv.style.gridColumn = '1 / -1';
            
            let infoText = '';
            if (searchParams.type === 'ingredient') {
                infoText = `Showing recipes with "${searchParams.value}"`;
            } else if (searchParams.type === 'pastaType') {
                infoText = `Showing ${searchParams.value} recipes`;
            }
            
            searchInfoDiv.innerHTML = `
                ${infoText}
                <span class="clear-search" onclick="window.goToHome()">Clear search</span>
            `;
            
            recipesContainer.appendChild(searchInfoDiv);
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
    
    // Expose the resetToHome function to the window object for the clear search button
    window.goToHome = function() {
        resetToHome();
    };
    
    // Utility functions
    function showLoading() {
        loadingIndicator.classList.remove('hidden');
    }
    
    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }
    
    function clearRecipesContainer() {
        recipesContainer.innerHTML = '';
    }
    
    function showError(message) {
        recipesContainer.innerHTML = `
            <div style="text-align: center; color: #e53e3e; grid-column: 1 / -1;">
                <p>${message}</p>
            </div>
        `;
    }
});