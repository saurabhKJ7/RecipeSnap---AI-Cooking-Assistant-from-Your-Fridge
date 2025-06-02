import os
import random
import base64
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Common food ingredients for simulated detection
FOOD_ITEMS = [
    "apple", "orange", "banana", "carrot", "broccoli", "tomato", "potato", "onion", 
    "garlic", "pepper", "cheese", "milk", "egg", "chicken", "beef", "fish", "rice", 
    "pasta", "bread", "butter", "oil", "salt", "sugar", "flour", "lemon", "lime",
    "avocado", "cucumber", "lettuce", "spinach", "mushroom", "corn", "peas", "beans",
    "yogurt", "cream", "bacon", "sausage", "ham", "tofu", "shrimp", "salmon"
]

# Image captions for common food items
FOOD_CAPTIONS = [
    "A refrigerator filled with fresh ingredients",
    "Various fresh vegetables and fruits on a kitchen counter",
    "A collection of ingredients ready for cooking",
    "Fresh produce from the market",
    "Healthy ingredients for a delicious meal"
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Save the uploaded image
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Process the image
    try:
        # Open image for processing (just to verify it's a valid image)
        image = Image.open(filepath)
        
        # Simulate AI processing with random ingredients and caption
        # In a real app, this would use the AI models mentioned in the requirements
        detected_ingredients = simulate_ingredient_detection()
        caption = random.choice(FOOD_CAPTIONS)
        
        # Generate recipe based on detected ingredients
        recipe = generate_recipe(detected_ingredients)
        
        # Prepare image for display
        with open(filepath, "rb") as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'caption': caption,
            'ingredients': detected_ingredients,
            'recipe': recipe,
            'image': img_data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def simulate_ingredient_detection():
    """
    Simulates AI ingredient detection by randomly selecting ingredients.
    In a real app, this would use the image captioning and object detection models.
    """
    # Randomly select 3-7 ingredients
    num_ingredients = random.randint(3, 7)
    detected_ingredients = random.sample(FOOD_ITEMS, num_ingredients)
    return sorted(detected_ingredients)

def generate_recipe(ingredients):
    """
    Generate a recipe based on the detected ingredients.
    In a production environment, this would use the Mistral-7B-Instruct model.
    """
    if not ingredients:
        return "No ingredients detected. Please try another image with clearer food items."
    
    # For demonstration, we'll use a template-based approach
    ingredients_text = ", ".join(ingredients)
    
    # Create a more customized recipe based on the ingredients
    main_ingredients = ingredients[:2]  # Use the first two ingredients as main components
    secondary_ingredients = ingredients[2:] if len(ingredients) > 2 else []
    
    # Determine recipe type based on ingredients
    recipe_type = determine_recipe_type(ingredients)
    
    recipe_template = f"""
# {recipe_type} with {ingredients_text}

## Ingredients:
{chr(10).join(['- ' + ingredient for ingredient in ingredients])}
- Salt and pepper to taste
- Olive oil
- Herbs and spices

## Instructions:
1. Prepare all ingredients: wash, peel, and chop {ingredients_text} as needed.
2. Heat a pan with olive oil over medium heat.
3. {get_cooking_step(main_ingredients)}
4. {get_cooking_step(secondary_ingredients) if secondary_ingredients else 'Continue cooking for a few more minutes.'}
5. Season with salt, pepper, and your favorite herbs and spices.
6. {get_final_step(recipe_type)}
7. Serve hot and enjoy your meal!

## Tips:
- This recipe is flexible - feel free to add or substitute ingredients based on what you have.
- For a more complex flavor, add garlic and onions if available.
- Garnish with fresh herbs before serving for extra flavor.
    """
    
    return recipe_template

def determine_recipe_type(ingredients):
    """Determine a suitable recipe type based on ingredients"""
    protein_ingredients = ["chicken", "beef", "fish", "tofu", "egg", "shrimp", "salmon", "bacon", "ham"]
    carb_ingredients = ["rice", "pasta", "bread", "potato"]
    veggie_ingredients = ["broccoli", "carrot", "tomato", "spinach", "lettuce", "cucumber", "avocado"]
    
    for ingredient in ingredients:
        if ingredient in protein_ingredients:
            if "rice" in ingredients:
                return "Savory Rice Bowl"
            elif "pasta" in ingredients:
                return "Pasta Dish"
            elif any(veg in ingredients for veg in veggie_ingredients):
                return "Healthy Protein Meal"
            return "Delicious Protein Dish"
        
    if any(carb in ingredients for carb in carb_ingredients):
        return "Comforting Meal"
    
    if any(veg in ingredients for veg in veggie_ingredients):
        return "Fresh Vegetable Dish"
    
    return "Delicious Recipe"

def get_cooking_step(ingredients):
    """Generate a cooking step based on the ingredients"""
    if not ingredients:
        return "Continue cooking the mixture"
    
    protein_ingredients = ["chicken", "beef", "fish", "tofu", "egg", "shrimp", "salmon", "bacon", "ham"]
    veggie_ingredients = ["broccoli", "carrot", "tomato", "spinach", "lettuce", "cucumber", "avocado"]
    
    steps = []
    for ingredient in ingredients:
        if ingredient in protein_ingredients:
            steps.append(f"Add the {ingredient} and cook until properly done")
        elif ingredient in veggie_ingredients:
            steps.append(f"Add the {ingredient} and sauté until slightly tender")
        else:
            steps.append(f"Incorporate the {ingredient} into the mixture")
    
    return " then ".join(steps) + "."

def get_final_step(recipe_type):
    """Generate a final cooking step based on the recipe type"""
    if "Bowl" in recipe_type:
        return "Arrange everything in a bowl with your favorite toppings"
    elif "Pasta" in recipe_type:
        return "Mix everything together with the pasta until well combined"
    elif "Vegetable" in recipe_type:
        return "Cook until the vegetables reach your desired tenderness"
    else:
        return "Cook until all flavors are well combined and ingredients are fully cooked"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
