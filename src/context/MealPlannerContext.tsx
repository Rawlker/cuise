import React, { createContext, useContext, useEffect, useState } from 'react';
import { get, set } from 'idb-keyval';
import type { WeeklyPlan, Recipe, MealType } from '../types';
import { useShoppingList } from './ShoppingListContext';

interface MealPlannerContextType {
  plan: WeeklyPlan;
  addRecipeToPlan: (day: string, type: MealType, recipe: Recipe | Partial<Recipe>) => Promise<void>;
  removeRecipeFromPlan: (day: string, type: MealType) => Promise<void>;
  addAllToShoppingList: () => Promise<void>;
  clearPlan: () => Promise<void>;
}

const MealPlannerContext = createContext<MealPlannerContextType | undefined>(undefined);

const STORAGE_KEY = 'meal-planner-plan';
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const MealPlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<WeeklyPlan>({});
  const { addIngredients } = useShoppingList();

  useEffect(() => {
    const loadPlan = async () => {
      const saved = await get<WeeklyPlan>(STORAGE_KEY);
      if (saved) setPlan(saved);
    };
    loadPlan();
  }, []);

  const savePlan = async (newPlan: WeeklyPlan) => {
    setPlan(newPlan);
    await set(STORAGE_KEY, newPlan);
  };

  const addRecipeToPlan = async (day: string, type: MealType, recipe: Recipe | Partial<Recipe>) => {
    const newPlan = { ...plan };
    if (!newPlan[day]) newPlan[day] = {};
    newPlan[day][type] = recipe;
    await savePlan(newPlan);
  };

  const removeRecipeFromPlan = async (day: string, type: MealType) => {
    const newPlan = { ...plan };
    if (newPlan[day]) {
      delete newPlan[day][type];
      if (Object.keys(newPlan[day]).length === 0) {
        delete newPlan[day];
      }
    }
    await savePlan(newPlan);
  };

  const addAllToShoppingList = async () => {
    const allIngredients: any[] = [];
    
    Object.values(plan).forEach(dayPlan => {
      Object.values(dayPlan).forEach(recipe => {
        if (recipe && (recipe as Recipe).ingredients) {
          allIngredients.push(...(recipe as Recipe).ingredients);
        }
      });
    });

    if (allIngredients.length > 0) {
      await addIngredients(allIngredients);
    }
  };

  const clearPlan = async () => {
    await savePlan({});
  };

  return (
    <MealPlannerContext.Provider value={{ plan, addRecipeToPlan, removeRecipeFromPlan, addAllToShoppingList, clearPlan }}>
      {children}
    </MealPlannerContext.Provider>
  );
};

export const useMealPlanner = () => {
  const context = useContext(MealPlannerContext);
  if (!context) throw new Error('useMealPlanner must be used within a MealPlannerProvider');
  return context;
};
