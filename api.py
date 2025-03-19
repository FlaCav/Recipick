from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import select, Column, Integer, String, Text, text, create_engine
from sqlalchemy.dialects.postgresql import ARRAY
from pydantic import BaseModel
import os
from sqlalchemy.ext.declarative import declarative_base
from typing import Annotated

Base = declarative_base()

# Database connection
DATABASE_URL = "postgresql://myuser:mypassword@localhost/recipedb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

# FastAPI App
app = FastAPI(title="Recipe API", description="An API for searching pasta recipes")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# SQLAlchemy Model for Recipe (table schema)
class Recipe(Base):
    __tablename__ = 'recipes'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    difficulty = Column(String)
    ingredients = Column(ARRAY(Text))
    image_url = Column(String, nullable=True)
    pasta_type = Column(String, index=True)
    recipe_url = Column(String)
 
# Pydantic Model for Recipe Response (data validation)
class RecipeResponse(BaseModel):
    id: int
    title: str
    difficulty: str
    ingredients: list[str]
    image_url: str | None
    pasta_type: str
    recipe_url: str

    class Config:
        orm_mode = True

# ✅ API Endpoints

@app.get("/")
def root():
    return {"Hello" : "World"}

@app.get("/recipes", response_model=list[RecipeResponse])
async def get_recipes(db: db_dependency):
    """Fetch all recipes"""
    recipes = db.query(Recipe).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="Recipes not found")
    return recipes

@app.get("/recipes/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(recipe_id: int, db: db_dependency):
    """Fetch a single recipe by ID"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@app.get("/search")
async def search_recipes(ingredient: str, db: db_dependency):
    """Search recipes by ingredient"""
    recipes = db.query(Recipe).filter(Recipe.ingredients.contains({ingredient})).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipes

@app.get("/search/{pasta_type}")
async def search_recipes(pasta_type: str, db: db_dependency):
    """Search recipes by ingredient"""
    recipes = db.query(Recipe).filter(Recipe.pasta_type.ilike(f'%{pasta_type}%')).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipes

# Run with: uvicorn api:app --reload
