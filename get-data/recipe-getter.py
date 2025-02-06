import requests
from bs4 import BeautifulSoup
import psycopg2  # PostgreSQL connection
from urllib.parse import urljoin
import re

# Database connection
conn = psycopg2.connect(
    dbname="recipedb",
    user="myuser",
    password="mypassword",
    host="localhost",
    port="5432"
)
cur = conn.cursor()


# Base URL for pasta recipes
CATEGORY_URL = "https://www.giallozafferano.com/recipes-search/pasta/"

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
    """Extract recipe details and save to database."""
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Extracting data
    # Convert title, difficulty, pasta_type, and ingredients to lowercase
    title = soup.find("h1").get_text(strip=True).lower() if soup.find("h1") else "unknown"
    difficulty = soup.select_one(".gz-icon-difficulty + span")
    difficulty = difficulty.get_text(strip=True).lower() if difficulty else "unknown"
    image_tag = soup.find("img")
    image_url = image_tag["src"] if image_tag and "src" in image_tag.attrs else None
    ingredients = [clean_text(i.get_text(strip=True)).lower() for i in soup.select(".gz-ingredient a")]
    pasta_type = next((i.lower() for i in ingredients if "pasta" in i.lower()), "unknown")


    # Insert into PostgreSQL
    try:
        cur.execute("""
            INSERT INTO recipes (title, difficulty, ingredients, image_url, pasta_type, recipe_url)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (recipe_url) DO NOTHING;  -- Prevent duplicate entries
        """, (title, difficulty, ingredients, image_url, pasta_type, url))
        conn.commit()
        print(f"✅ Recipe saved: {title}")
    except Exception as e:
        print(f"❌ Error inserting {title}: {e}")


def scrape_recipes_from_base_url():
    # Get unique recipe links
    recipe_links = get_recipe_links()
    print(f"Found {len(recipe_links)} unique recipes!")

    # Get content and insert into db
    for link in recipe_links:
        scrape_recipe(link)

scrape_recipes_from_base_url()


# Close connection
cur.close()
conn.close()
