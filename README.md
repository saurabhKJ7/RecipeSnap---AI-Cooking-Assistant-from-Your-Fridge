# RecipeSnap - AI Cooking Assistant from Your Fridge

RecipeSnap is an AI-powered web application that helps you create delicious recipes from the ingredients in your fridge.

## Features

- **Ingredient Detection**: Upload a photo of your fridge or ingredients, and our AI will identify them
- **Recipe Generation**: Get personalized recipe recommendations based on detected ingredients
- **User-Friendly Interface**: Simple and intuitive design for a seamless experience

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Flask (Python)
- **AI Models**:
  - Image Captioning: nlpconnect/vit-gpt2-image-captioning
  - Object Detection: facebook/detr-resnet-50
  - Recipe Generation: mistralai/Mistral-7B-Instruct

## Installation

1. Clone this repository
2. Install dependencies: `pip install -r requirements.txt`
3. Run the application: `python app.py`
4. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Click the 'Upload Image' button to select a photo of your fridge or ingredients
2. Wait for the AI to process and identify ingredients
3. Review the detected ingredients and add/remove as needed
4. Click 'Generate Recipes' to get personalized recipe recommendations
5. Enjoy cooking your delicious meal!