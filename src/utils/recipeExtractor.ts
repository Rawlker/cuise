import axios from 'axios';
import type { Recipe, RecipeIngredient } from '../types';

export const estimateNutrition = (ingredients: RecipeIngredient[]) => {
  // Heuristic-based nutrition estimation for the prototype
  // In a production app, this would call an API like Nutritionix or Edamam
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;

  ingredients.forEach(ing => {
    const name = ing.name.toLowerCase();
    const amount = 1; // Base per ingredient

    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish')) {
      calories += 200 * amount;
      protein += 25 * amount;
      fat += 10 * amount;
    } else if (name.includes('rice') || name.includes('pasta') || name.includes('potato') || name.includes('bread')) {
      calories += 150 * amount;
      carbs += 30 * amount;
      fiber += 2 * amount;
    } else if (name.includes('oil') || name.includes('butter')) {
      calories += 100 * amount;
      fat += 11 * amount;
    } else if (name.includes('sugar') || name.includes('honey')) {
      calories += 50 * amount;
      carbs += 12 * amount;
    } else if (name.includes('egg')) {
      calories += 70 * amount;
      protein += 6 * amount;
      fat += 5 * amount;
    } else if (name.includes('vegetable') || name.includes('onion') || name.includes('garlic') || name.includes('tomato')) {
      calories += 20 * amount;
      carbs += 5 * amount;
      fiber += 2 * amount;
    } else if (name.includes('bean') || name.includes('lentil') || name.includes('chickpea')) {
      calories += 100 * amount;
      protein += 7 * amount;
      carbs += 20 * amount;
      fiber += 5 * amount;
    } else if (name.includes('cheese') || name.includes('milk') || name.includes('cream')) {
      calories += 80 * amount;
      protein += 5 * amount;
      fat += 6 * amount;
    } else {
      calories += 30 * amount;
      carbs += 5 * amount;
    }
  });

  // Normalize per portion (assuming average recipe in DB is for 2-4 portions)
  const factor = 0.5;
  return {
    calories: Math.round(calories * factor),
    protein: Math.round(protein * factor),
    carbs: Math.round(carbs * factor),
    fat: Math.round(fat * factor),
    fiber: Math.round(fiber * factor),
  };
};

export const extractRecipeFromUrl = async (url: string): Promise<Recipe | null> => {
  try {
    // Using a CORS proxy to bypass browser restrictions
    // We try corsproxy.io as primary and allorigins as fallback
    let html = '';
    try {
      const response = await axios.get(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      html = response.data;
    } catch (e) {
      console.warn('corsproxy.io failed, trying allorigins fallback');
      const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      html = response.data.contents;
    }

    if (!html) {
      throw new Error('No content received from proxy');
    }

    // Use DOMParser to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Find JSON-LD
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    let recipeData: any = null;

    for (const script of jsonLdScripts) {
      try {
        const json = JSON.parse(script.textContent || '');
        
        // JSON-LD can be an object or an array
        const findRecipe = (obj: any): any => {
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const result = findRecipe(item);
              if (result) return result;
            }
          } else if (obj && typeof obj === 'object') {
            if (obj['@type'] === 'Recipe' || (Array.isArray(obj['@type']) && obj['@type'].includes('Recipe'))) {
              return obj;
            }
            // Check for @graph
            if (obj['@graph']) {
              return findRecipe(obj['@graph']);
            }
          }
          return null;
        };

        recipeData = findRecipe(json);
        if (recipeData) break;
      } catch (e) {
        continue;
      }
    }

    if (!recipeData) {
      // Fallback: try to find metadata manually if JSON-LD is missing
      return null;
    }

    // Transform JSON-LD to Recipe type
    const ingredients: RecipeIngredient[] = (recipeData.recipeIngredient || []).map((ing: string) => ({
      name: ing,
      measure: '', // Often included in the name in JSON-LD
    }));

    const nutrition = estimateNutrition(ingredients);

    const instructions = Array.isArray(recipeData.recipeInstructions)
      ? recipeData.recipeInstructions
          .map((step: any) => {
            if (typeof step === 'string') return step;
            if (step['@type'] === 'HowToStep') return step.text;
            if (step['@type'] === 'HowToSection') {
              return step.itemListElement
                .map((s: any) => (typeof s === 'string' ? s : s.text))
                .join('\n');
            }
            return '';
          })
          .join('\n')
      : recipeData.recipeInstructions || '';

    const rawThumbnail = Array.isArray(recipeData.image) 
      ? recipeData.image[0]?.url || recipeData.image[0]
      : recipeData.image?.url || recipeData.image || '';

    let thumbnail = '';
    if (typeof rawThumbnail === 'string' && rawThumbnail) {
      try {
        // Ensure absolute URL
        thumbnail = new URL(rawThumbnail, url).href;
      } catch (e) {
        thumbnail = rawThumbnail;
      }
    }

    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `imported-${crypto.randomUUID()}` 
      : `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      title: recipeData.name || doc.title || 'Imported Recipe',
      instructions,
      thumbnail,
      category: Array.isArray(recipeData.recipeCategory) ? recipeData.recipeCategory[0] : recipeData.recipeCategory || 'Imported',
      area: 'Unknown',
      ingredients,
      tags: [],
      isImported: true,
      sourceUrl: url,
      nutrition,
    };
  } catch (error) {
    console.error('Error extracting recipe:', error);
    return null;
  }
};
