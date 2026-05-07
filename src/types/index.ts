export interface Recipe {
  id: string;
  title: string;
  instructions: string;
  thumbnail: string;
  category: string;
  area: string;
  ingredients: RecipeIngredient[];
  tags: string[];
  youtubeUrl?: string;
  isImported?: boolean;
  sourceUrl?: string;
  nutrition?: RecipeNutrition;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  measure: string;
  bought: boolean;
}

export interface RecipeIngredient {
  name: string;
  measure: string;
  image?: string;
  description?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealSlot {
  recipe: Recipe | Partial<Recipe>;
}

export interface WeeklyPlan {
  [day: string]: {
    breakfast?: Recipe | Partial<Recipe>;
    lunch?: Recipe | Partial<Recipe>;
    dinner?: Recipe | Partial<Recipe>;
  }
}

export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strInstructions: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strTags: string;
  strYoutube: string;
  [key: string]: string | undefined;
}
