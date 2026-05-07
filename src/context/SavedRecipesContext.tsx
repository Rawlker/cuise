import React, { createContext, useContext, useEffect, useState } from 'react';
import { get, set, del, keys } from 'idb-keyval';
import type { Recipe } from '../types';

interface SavedRecipesContextType {
  savedRecipes: Recipe[];
  saveRecipe: (recipe: Recipe) => Promise<void>;
  removeRecipe: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(undefined);

export const SavedRecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const loadRecipes = async () => {
      const allKeys = await keys();
      // Exclude keys that are not recipes
      const excludedKeys = ['shopping-list', 'meal-planner-plan', 'fridge-ingredients'];
      const recipeKeys = allKeys.filter(key => typeof key === 'string' && !excludedKeys.includes(key));
      const recipes = await Promise.all(recipeKeys.map(key => get(key)));
      setSavedRecipes(recipes.filter(Boolean));
    };
    loadRecipes();
  }, []);

  const saveRecipe = async (recipe: Recipe) => {
    await set(recipe.id, recipe);
    setSavedRecipes(prev => [...prev, recipe]);
  };

  const removeRecipe = async (id: string) => {
    await del(id);
    setSavedRecipes(prev => prev.filter(r => r.id !== id));
  };

  const isSaved = (id: string) => savedRecipes.some(r => r.id === id);

  return (
    <SavedRecipesContext.Provider value={{ savedRecipes, saveRecipe, removeRecipe, isSaved }}>
      {children}
    </SavedRecipesContext.Provider>
  );
};

export const useSavedRecipes = () => {
  const context = useContext(SavedRecipesContext);
  if (!context) throw new Error('useSavedRecipes must be used within a SavedRecipesProvider');
  return context;
};
