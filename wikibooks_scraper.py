import re
import requests
from bs4 import BeautifulSoup
import json

BASE_URL = "https://en.wikibooks.org"

def fetch_page(url):
    response = requests.get(url)
    return response.content

def get_recipe_links():
    url_end="/wiki/Category:Recipes"
    recipe_links=[]
    while True:
        url = f"{BASE_URL}{url_end}"
        html = fetch_page(url)
        soup = BeautifulSoup(html, 'html.parser')
        box=soup.find(id="mw-pages").find("div", class_="mw-category mw-category-columns")
        links = box.find_all("li")
        for link in links:
            a_tag = link.find("a")
            if a_tag and 'href' in a_tag.attrs:
                recipe_links.append(f"{BASE_URL}{a_tag['href']}")
        next_page = soup.find("a", string="next page")
        if next_page:
            url_end = next_page['href']
        else:
            break
    return recipe_links

def scrape_recipe(url):
    html = fetch_page(url)
    soup = BeautifulSoup(html, 'html.parser')
    
    title = soup.find("h1", id="firstHeading").get_text(strip=True)[9:]
    
    ingredients = []
    ingredients_section = soup.find("h2", string=re.compile("Ingredient")).parent
    if ingredients_section:
        current_element = ingredients_section.find_next_sibling()
        while current_element and "mw-heading" not in current_element.get('class', []):
            if current_element.name == "ul":
                ingredients.extend([li.get_text() for li in current_element.find_all('li')])
            current_element = current_element.find_next_sibling()
    
    procedures = [li.get_text() for li in soup.find('ol').find_all('li')]
    
    if ingredients:
        return {"title": title, "ingredients": ingredients, "procedure": procedures}
    else:
        return None

def save_data(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)


recipe_links = get_recipe_links()
recipes = []
for link in recipe_links:
    try:
        recipe = scrape_recipe(link)
        if recipe:
            recipes.append(recipe)
            print(f"Scraped: {link}")
    except Exception as e:
        print(f"Failed to scrape {link}: {e}")
save_data(recipes, 'recipes.json')
