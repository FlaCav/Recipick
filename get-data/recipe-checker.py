import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re

# Base URL for pasta recipes
CATEGORY_URL = "https://www.giallozafferano.com/recipes-search/pasta/" #/page1, /page2, etc

def get_recipe_links():
    """Fetch and return a list of unique recipe URLs from the category page."""
    response = requests.get(CATEGORY_URL)
    soup = BeautifulSoup(response.text, 'html.parser')

    recipe_links = set()  # Use a set to remove duplicates

    for a in soup.select("article a[title]"):
        href = a["href"]
        full_url = urljoin("https://www.giallozafferano.com", href)

        # Only add valid recipe links
        if "/recipes/" in full_url:
            recipe_links.add(full_url)

    return list(recipe_links)


def clean_text(text):
    """Remove unnecessary whitespace, newlines, and extra characters."""
    text = re.sub(r"\s+", " ", text)  # Replace multiple spaces/newlines with a single space
    text = re.sub(r"\([^)]*\)", "", text)  # Remove text inside parentheses (measurements)
    return text.strip()  # Trim leading/trailing spaces

def scrape_recipe(url):
    """Extract recipe details (name, ingredients, image, difficulty, pasta type)."""
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Extracting recipe title
    title = soup.find("h1").get_text(strip=True) if soup.find("h1") else "Unknown"

    # Extracting difficulty level
    difficulty = soup.select_one(".gz-icon-difficulty + span")
    difficulty = difficulty.get_text(strip=True) if difficulty else "Unknown"

    # Extracting image URL
    image_tag = soup.find("img", {"class": "gz-image"})
    image_url = image_tag["src"] if image_tag else None

    # Extracting correct ingredient names (updated selector)
    ingredients = [clean_text(i.get_text(strip=True)) for i in soup.select(".gz-ingredient a")]

    # Checking pasta type (if 'pasta' is in the ingredients list)
    pasta_type = next((i for i in ingredients if "pasta" in i.lower()), "Unknown")

    # Extracting recipe URL
    recipe_url = url  

    return {
        "title": title,
        "difficulty": difficulty,
        "ingredients": ingredients,
        "image_url": image_url,
        "pasta_type": pasta_type,
        "recipe_url": recipe_url
    }


# Step 1: Get unique recipe links
recipe_links = get_recipe_links()
print(f"Found {len(recipe_links)} unique recipes!")

# Step 2: Scrape each recipe
recipes = []
for link in recipe_links:
    print(f"Scraping {link}...")
    recipe_data = scrape_recipe(link)
    recipes.append(recipe_data)

# Step 3: Print results for debugging
print("✅ Scraping complete! Here are some results:")
for r in recipes[:5]:  # Show only first 5 results
    print(r)
