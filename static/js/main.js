// RecipeSnap - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const removeImageBtn = document.getElementById('remove-image');
    const loadingIndicator = document.getElementById('loading');
    const ingredientsContainer = document.getElementById('ingredients-container');
    const ingredientsList = document.getElementById('ingredients-list');
    const newIngredientInput = document.getElementById('new-ingredient');
    const addIngredientBtn = document.getElementById('add-ingredient');
    const generateRecipeBtn = document.getElementById('generate-recipe');
    const initialMessage = document.getElementById('initial-message');
    const recipeContainer = document.getElementById('recipe-container');
    const recipeContent = document.getElementById('recipe-content');
    
    // Current state
    let currentIngredients = [];
    let uploadedImageData = null;
    
    // Event Listeners
    uploadButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    removeImageBtn.addEventListener('click', resetUI);
    addIngredientBtn.addEventListener('click', addCustomIngredient);
    generateRecipeBtn.addEventListener('click', generateRecipe);
    newIngredientInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCustomIngredient();
    });
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    // Functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('dragover');
    }
    
    function unhighlight() {
        dropArea.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            fileInput.files = files;
            handleFileSelect();
        }
    }
    
    function handleFileSelect() {
        if (!fileInput.files.length) return;
        
        const file = fileInput.files[0];
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, etc.)');
            return;
        }
        
        // Display preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewContainer.classList.remove('d-none');
            dropArea.classList.add('d-none');
            
            // Show loading indicator
            loadingIndicator.classList.remove('d-none');
            
            // Upload the image to server
            uploadImage(file);
        };
        reader.readAsDataURL(file);
    }
    
    function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Hide loading indicator
            loadingIndicator.classList.add('d-none');
            
            if (data.success) {
                // Store image data
                uploadedImageData = data.image;
                
                // Display ingredients
                currentIngredients = data.ingredients;
                displayIngredients();
                ingredientsContainer.classList.remove('d-none');
                
                // Display recipe
                displayRecipe(data.recipe);
            } else {
                alert('Error: ' + data.error);
                resetUI();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingIndicator.classList.add('d-none');
            alert('An error occurred while processing your image. Please try again.');
            resetUI();
        });
    }
    
    function displayIngredients() {
        ingredientsList.innerHTML = '';
        
        currentIngredients.forEach(ingredient => {
            const tag = document.createElement('span');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                ${ingredient}
                <span class="remove-ingredient" data-ingredient="${ingredient}">
                    <i class="fas fa-times"></i>
                </span>
            `;
            ingredientsList.appendChild(tag);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-ingredient').forEach(btn => {
            btn.addEventListener('click', function() {
                const ingredient = this.getAttribute('data-ingredient');
                removeIngredient(ingredient);
            });
        });
    }
    
    function addCustomIngredient() {
        const ingredient = newIngredientInput.value.trim().toLowerCase();
        
        if (ingredient && !currentIngredients.includes(ingredient)) {
            currentIngredients.push(ingredient);
            displayIngredients();
            newIngredientInput.value = '';
        }
    }
    
    function removeIngredient(ingredient) {
        currentIngredients = currentIngredients.filter(item => item !== ingredient);
        displayIngredients();
    }
    
    function generateRecipe() {
        if (currentIngredients.length === 0) {
            alert('Please add at least one ingredient to generate a recipe.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.classList.remove('d-none');
        
        // For demo purposes, we'll just use the template from the backend
        // In a real app, this would make another API call
        setTimeout(() => {
            const ingredients = currentIngredients.join(', ');
            
            const recipeTemplate = `
# Delicious Recipe with ${ingredients}

## Ingredients:
${currentIngredients.map(ingredient => `- ${ingredient}`).join('\n')}
- Salt and pepper to taste
- Olive oil
- Herbs and spices

## Instructions:
1. Prepare all ingredients: wash, peel, and chop as needed.
2. Heat a pan with olive oil over medium heat.
3. Add the main ingredients and sauté until they start to soften.
4. Season with salt, pepper, and your favorite herbs and spices.
5. Cook until all ingredients are properly cooked through.
6. Serve hot and enjoy your meal!

## Tips:
- This recipe is flexible - feel free to add or substitute ingredients based on what you have.
- For a more complex flavor, add garlic and onions if available.
- Garnish with fresh herbs before serving for extra flavor.
            `;
            
            displayRecipe(recipeTemplate);
            loadingIndicator.classList.add('d-none');
        }, 1000);
    }
    
    function displayRecipe(recipe) {
        // Use marked.js to convert markdown to HTML
        recipeContent.innerHTML = marked.parse(recipe);
        initialMessage.classList.add('d-none');
        recipeContainer.classList.remove('d-none');
    }
    
    function resetUI() {
        // Reset file input
        fileInput.value = '';
        
        // Hide containers
        previewContainer.classList.add('d-none');
        loadingIndicator.classList.add('d-none');
        ingredientsContainer.classList.add('d-none');
        
        // Show drop area
        dropArea.classList.remove('d-none');
        
        // Reset recipe view
        recipeContainer.classList.add('d-none');
        initialMessage.classList.remove('d-none');
        
        // Clear state
        currentIngredients = [];
        uploadedImageData = null;
    }
});
