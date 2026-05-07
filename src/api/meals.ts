import axios from 'axios';
import { get } from 'idb-keyval';
import type { MealDBMeal, Recipe, RecipeIngredient } from '../types';

import { estimateNutrition } from '../utils/recipeExtractor';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  // Check if it's an imported recipe
  if (id.startsWith('imported-')) {
    try {
      const saved = await get(id) as Recipe;
      if (saved && !saved.nutrition) {
        saved.nutrition = estimateNutrition(saved.ingredients);
      }
      return saved || null;
    } catch (error) {
      console.error('Error fetching imported recipe:', error);
      return null;
    }
  }

  try {
    const response = await apiClient.get(`/lookup.php?i=${id}`);
    const meal = response.data.meals?.[0] as MealDBMeal;
    if (!meal) return null;
    return transformMeal(meal);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
};

export const searchRecipesByIngredient = async (ingredient: string): Promise<Partial<Recipe>[]> => {
  try {
    const response = await apiClient.get(`/filter.php?i=${ingredient}`);
    return (response.data.meals || []).map((meal: any) => ({
      id: meal.idMeal,
      title: meal.strMeal,
      thumbnail: meal.strMealThumb,
    }));
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
};

export const getRandomRecipe = async (): Promise<Recipe | null> => {
  try {
    const response = await apiClient.get('/random.php');
    const meal = response.data.meals?.[0] as MealDBMeal;
    if (!meal) return null;
    return transformMeal(meal);
  } catch (error) {
    console.error('Error fetching random recipe:', error);
    return null;
  }
};

export const searchRecipesByName = async (name: string): Promise<Partial<Recipe>[]> => {
  try {
    const response = await apiClient.get(`/search.php?s=${name}`);
    return (response.data.meals || []).map((meal: any) => ({
      id: meal.idMeal,
      title: meal.strMeal,
      thumbnail: meal.strMealThumb,
    }));
  } catch (error) {
    console.error('Error searching recipes by name:', error);
    return [];
  }
};

export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get('/list.php?c=list');
    return (response.data.meals || []).map((m: any) => m.strCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getAllIngredients = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get('/list.php?i=list');
    return (response.data.meals || []).map((m: any) => m.strIngredient);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
};

export const getRecipesByCategory = async (category: string): Promise<Partial<Recipe>[]> => {
  try {
    const response = await apiClient.get(`/filter.php?c=${category}`);
    return (response.data.meals || []).map((meal: any) => ({
      id: meal.idMeal,
      title: meal.strMeal,
      thumbnail: meal.strMealThumb,
    }));
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    return [];
  }
};

const transformMeal = (meal: MealDBMeal): Recipe => {
  const ingredients: RecipeIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({
        name: name.trim(),
        measure: measure?.trim() || '',
        image: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name.trim())}.png`,
      });
    }
  }

  const nutrition = estimateNutrition(ingredients);

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    instructions: meal.strInstructions,
    thumbnail: meal.strMealThumb,
    category: meal.strCategory,
    area: meal.strArea,
    ingredients,
    tags: meal.strTags ? meal.strTags.split(',') : [],
    youtubeUrl: meal.strYoutube,
    nutrition,
  };
};

// Simplified translation utility (to be expanded)
export const translateContent = async (text: string, targetLang: string): Promise<string> => {
  if (targetLang === 'en') return text;
  // In a real app, we might use a translation API. 
  // For this prototype, we'll use a mocked translation or return as is with a flag.
  return text; 
};
