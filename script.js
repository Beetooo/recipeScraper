let recipes = [];
let userIngredients = new Set();

// Function to fetch and initialize recipes
function fetchRecipes() {
    fetch('recipes.json')
        .then(response => response.json())
        .then(data => {
            recipes = data.map(recipe => {
                recipe.missing = calculateMissingIngredients(recipe);
                return recipe;
            });
            displayRecipes();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to calculate missing ingredients for each recipe based on userIngredients
function calculateMissingIngredients(recipe) {
    let matched = 0;
    recipe.ingredients.forEach(ingredient => {
        let included = false;
        userIngredients.forEach(userIngredient => {
            if (ingredient.toLowerCase().includes(userIngredient.toLowerCase())) {
                included = true;
            }
        });
        if (included) {
            matched++;
        }
    });
    return 1 - (matched / recipe.ingredients.length);
}

// Function to sort recipes by missing ingredients
function sortRecipes() {
    recipes.sort((a, b) => a.missing - b.missing);
}

// Function to display recipes in the UI
function displayRecipes() {
    sortRecipes();
    const recipesContainer = document.getElementById('recipes-container');
    recipesContainer.innerHTML = '';

    recipes.slice(0, 20).forEach(recipe => {
        const recipeElement = createRecipeElement(recipe);
        let timer;

        recipeElement.addEventListener('mouseenter', (event) => {
            clearTimeout(timer);
            const mouseY = event.clientY;
            const elementRect = recipeElement.getBoundingClientRect();
            const elementTop = elementRect.top;
            const offset = mouseY - elementTop;
            recipeElement.classList.add('expanded');
            window.scrollBy({
                top: offset - (window.innerHeight / 2),
                behavior: 'smooth'
            });
        });

        recipeElement.addEventListener('mouseleave', () => {
            timer = setTimeout(() => {
                recipeElement.classList.remove('expanded');
            }, 100);
        });

        recipesContainer.appendChild(recipeElement);
    });

    displayUserIngredients(); // Update displayed user ingredients
}

// Function to create a recipe element dynamically
function createRecipeElement(recipe) {
    const recipeElement = document.createElement('div');
    recipeElement.classList.add('recipe');

    const titleElement = document.createElement('h2');
    titleElement.textContent = `${recipe.title} ${Math.round(100 - recipe.missing * 100)}%`;
    recipeElement.appendChild(titleElement);

    const ingredientsElement = document.createElement('ul');
    recipe.ingredients.forEach(ingredient => {
        const listItem = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = ingredient;

        let label = document.createElement('label');
        label.htmlFor = ingredient;
        label.appendChild(document.createTextNode(ingredient));

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        ingredientsElement.appendChild(listItem);
    });
    recipeElement.appendChild(ingredientsElement);

    const procedureElement = document.createElement('ol');
    recipe.procedure.forEach(step => {
        const stepItem = document.createElement('li');
        stepItem.textContent = step;
        procedureElement.appendChild(stepItem);
    });
    recipeElement.appendChild(procedureElement);

    return recipeElement;
}

// Function to handle refresh button click
document.getElementById('refreshButton').addEventListener('click', updateAndDisplayRecipes);

// Function to handle ingredient input on pressing Enter
document.getElementById('ingredientInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const userInput = this.value.trim().toLowerCase();
        if (userInput !== '' && !userIngredients.has(userInput)) {
            userIngredients.add(userInput);
            this.value = ''; // Clear input field after adding ingredient
            displayUserIngredients(); // Update displayed user ingredients
            updateAndDisplayRecipes(); // Refresh recipes based on updated ingredients
        }
    }
});

// Function to display all user-entered ingredients with remove buttons
function displayUserIngredients() {
    const userIngredientsList = document.getElementById('userIngredientsList');
    userIngredientsList.innerHTML = '';
    userIngredients.forEach(ingredient => {
        const listItem = document.createElement('li');
        listItem.textContent = ingredient;
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            userIngredients.delete(ingredient);
            displayUserIngredients(); // Update displayed user ingredients
            updateAndDisplayRecipes(); // Refresh recipes based on updated ingredients
        });

        listItem.appendChild(removeButton);
        userIngredientsList.appendChild(listItem);
    });
}

// Function to update and display recipes based on user ingredients
function updateAndDisplayRecipes() {
    recipes.forEach(recipe => {
        recipe.missing = calculateMissingIngredients(recipe);
    });
    displayRecipes();
}

// Fetch recipes once on page load
fetchRecipes();
