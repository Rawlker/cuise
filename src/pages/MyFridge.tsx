import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Plus, ChevronRight, Loader2, Info } from 'lucide-react';
import { getAllIngredients, searchRecipesByIngredient, getRecipeById } from '../api/meals';
import type { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { useFridge } from '../context/FridgeContext';

interface MatchRecipe extends Recipe {
  missingCount: number;
  matchedCount: number;
  totalCount: number;
  matchLevel: 'green' | 'yellow' | 'grey';
}

export const MyFridge: React.FC = () => {
  const { t } = useTranslation();
  const { myIngredients, addIngredient: contextAddIngredient, removeIngredient } = useFridge();
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<MatchRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllIngredients().then(setAllIngredients);
  }, []);

  useEffect(() => {
    if (inputValue.trim().length > 1) {
      const filtered = allIngredients
        .filter(ing => 
          ing.toLowerCase().includes(inputValue.toLowerCase()) && 
          !myIngredients.some(i => i.toLowerCase() === ing.toLowerCase())
        )
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, allIngredients, myIngredients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addIngredient = (ing: string) => {
    contextAddIngredient(ing);
    setInputValue('');
    setShowSuggestions(false);
  };

  const findRecipes = async () => {
    if (myIngredients.length < 2) return;
    
    setLoading(true);
    setRecipes([]);
    
    try {
      // Fetch recipes for the first few ingredients and combine
      // Using more than one search increases results variety
      const searchCount = Math.min(myIngredients.length, 3);
      const searchPromises = myIngredients.slice(0, searchCount).map(ing => searchRecipesByIngredient(ing));
      const searchResults = await Promise.all(searchPromises);
      
      // Flatten and get unique IDs
      const uniqueIds = Array.from(new Set(searchResults.flat().map(r => r.id)));
      
      // Fetch details for top 15 results to calculate match (to avoid too many API calls)
      const detailPromises = uniqueIds.slice(0, 15).map(id => getRecipeById(id!));
      const fullRecipes = (await Promise.all(detailPromises)).filter((r): r is Recipe => r !== null);
      
      const matchedRecipes: MatchRecipe[] = fullRecipes.map(recipe => {
        const recipeIngNames = recipe.ingredients.map(i => i.name.toLowerCase());
        const myIngNames = myIngredients.map(i => i.toLowerCase());
        
        const matched = recipeIngNames.filter(ri => {
          // Check if recipe ingredient is in my fridge
          // We use simple substring match or exact match
          return myIngNames.some(mi => ri.includes(mi) || mi.includes(ri));
        });
        
        const matchedCount = matched.length;
        const totalCount = recipeIngNames.length;
        const missingCount = totalCount - matchedCount;
        
        let matchLevel: 'green' | 'yellow' | 'grey' = 'grey';
        
        if (missingCount === 0) matchLevel = 'green';
        else if (missingCount <= 2) matchLevel = 'yellow';
        
        return { ...recipe, missingCount, matchedCount, totalCount, matchLevel };
      }).filter(r => r.matchedCount > 0);
      
      // Sort by matchedCount descending, then by missingCount ascending
      matchedRecipes.sort((a, b) => {
        if (b.matchedCount !== a.matchedCount) {
          return b.matchedCount - a.matchedCount;
        }
        return a.missingCount - b.missingCount;
      });
      
      setRecipes(matchedRecipes);
    } catch (error) {
      console.error('Error finding recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
          <Search size={32} />
        </div>
        <h2 className="text-3xl font-black tracking-tight mb-2 italic uppercase">{t('my_fridge')}</h2>
        <p className="text-text-app/50 font-medium">{t('fridge_placeholder')}</p>
      </div>

      <div className="relative mb-8" ref={suggestionsRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-app/60 group-focus-within:text-primary transition-colors">
            <Plus size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-14 pr-6 py-4 bg-surface-app border-2 border-transparent focus:border-primary/30 focus:bg-surface-app rounded-2xl outline-none transition-all duration-300 font-bold shadow-sm group-hover:shadow-md"
            placeholder={t('search_placeholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-surface-app rounded-2xl shadow-2xl border border-border-app overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-6 py-3 text-left hover:bg-primary/5 hover:text-primary transition-colors font-bold flex items-center justify-between group"
                onClick={() => addIngredient(suggestion)}
              >
                {suggestion}
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8 min-h-[48px]">
        {myIngredients.map((ing, index) => (
          <span
            key={index}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm animate-in zoom-in duration-300 border border-primary/20"
          >
            {ing}
            <button
              onClick={() => removeIngredient(ing)}
              className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        {myIngredients.length === 0 && (
          <div className="text-text-app/60 text-sm italic py-2 flex items-center gap-2">
            <Info size={14} />
            {t('min_ingredients')}
          </div>
        )}
      </div>

      <button
        onClick={findRecipes}
        disabled={myIngredients.length < 2 || loading}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
          myIngredients.length < 2 || loading
            ? 'bg-surface-app text-text-app/60 cursor-not-allowed'
            : 'bg-primary text-text-app hover:scale-[1.02] active:scale-95 shadow-primary/30'
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <>
            <Search size={20} />
            {t('find_recipes')}
          </>
        )}
      </button>

      {recipes.length > 0 && (
        <div className="mt-12 space-y-8">
          <h3 className="text-xl font-extrabold flex items-center gap-3">
            {t('search_results')}
            <span className="text-sm font-bold px-3 py-1 bg-surface-app rounded-full text-text-app/50">
              {recipes.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-8">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="relative group">
                <div className={`absolute -inset-1 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${
                  recipe.matchLevel === 'green' ? 'bg-green-500' :
                  recipe.matchLevel === 'yellow' ? 'bg-amber-500' : 'bg-surface-app/40'
                }`}></div>
                <div className="relative">
                  <RecipeCard recipe={recipe} />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                      recipe.matchLevel === 'green' ? 'bg-green-500 text-text-app' :
                      recipe.matchLevel === 'yellow' ? 'bg-amber-500 text-text-app' : 'bg-surface-app text-text-app'
                    }`}>
                      {recipe.matchLevel === 'green' ? t('perfect_match') :
                       recipe.matchLevel === 'yellow' ? t('missing_some') : t('missing_many')}
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-surface-app/90 backdrop-blur-sm text-[10px] font-bold text-text-app shadow-md border border-border-app">
                      {t('ingredients_matched', { matched: recipe.matchedCount, total: recipe.totalCount })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && recipes.length === 0 && myIngredients.length >= 2 && (
        <div className="mt-12 p-8 text-center bg-surface-app/50 rounded-3xl border-2 border-dashed border-border-app">
          <div className="text-text-app/60 font-bold">{t('no_results_found', 'No recipes found with these ingredients')}</div>
        </div>
      )}
    </div>
  );
};
