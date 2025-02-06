import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

category_url = "https://www.giallozafferano.com/recipes-search/pasta/"

# Fetch the category page
response = requests.get(category_url)
soup = BeautifulSoup(response.text, 'html.parser')

# Use a set to store unique recipe URLs
recipe_links = set()

for a in soup.select("article a[title]"):
    href = a["href"]
    
    # Ensure valid absolute URL
    full_url = urljoin("https://www.giallozafferano.com", href)
    
    # Filter out non-recipe links and add to the set
    if "/recipes/" in full_url:
        recipe_links.add(full_url)

# Convert back to a list for processing
recipe_links = list(recipe_links)

# Print the results
print(f"Found {len(recipe_links)} unique recipes.")
for link in recipe_links:
    print(link)
