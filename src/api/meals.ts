import { get } from 'idb-keyval';
import { estimateNutrition } from '../utils/recipeExtractor';
import type { Recipe } from '../types';
import recipesData from '../data/recipes.json';

const localRecipes: Recipe[] = (recipesData as any).recipes.map((r: any) => ({
  ...r,
  instructions: Array.isArray(r.instructions)
    ? r.instructions.join('\n')
    : r.instructions,
  nutrition: r.nutrition || estimateNutrition(r.ingredients),
}));

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
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
  return localRecipes.find(r => r.id === id) || null;
};

export const getRandomRecipe = async (): Promise<Recipe | null> => {
  const idx = Math.floor(Math.random() * localRecipes.length);
  return localRecipes[idx];
};

export const searchRecipesByName = async (name: string): Promise<Partial<Recipe>[]> => {
  const q = name.toLowerCase();
  return localRecipes
    .filter(r => r.title.toLowerCase().includes(q))
    .map(r => ({ id: r.id, title: r.title, thumbnail: r.thumbnail }));
};

export const searchRecipesByIngredient = async (ingredient: string): Promise<Partial<Recipe>[]> => {
  const q = ingredient.toLowerCase();
  return localRecipes
    .filter(r => r.ingredients.some(i => i.name.toLowerCase().includes(q)))
    .map(r => ({ id: r.id, title: r.title, thumbnail: r.thumbnail }));
};

export const getCategories = async (): Promise<string[]> => {
  return [...new Set(localRecipes.map(r => r.category))].sort();
};

export const getAllIngredients = async (): Promise<string[]> => {
  const all = localRecipes.flatMap(r => r.ingredients.map(i => i.name));
  return [...new Set(all)].sort();
};

export const getRecipesByCategory = async (category: string): Promise<Partial<Recipe>[]> => {
  return localRecipes
    .filter(r => r.category === category)
    .map(r => ({ id: r.id, title: r.title, thumbnail: r.thumbnail }));
};

export const translateContent = async (text: string, targetLang: string): Promise<string> => {
  if (targetLang === 'en') return text;
  return text;
};
