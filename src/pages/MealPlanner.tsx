import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMealPlanner } from '../context/MealPlannerContext';
import { useSavedRecipes } from '../context/SavedRecipesContext';
import { searchRecipesByName, getRecipeById } from '../api/meals';
import type { Recipe, MealType } from '../types';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Search as SearchIcon, 
  X, 
  ChevronRight, 
  Loader2,
  Bookmark,
  Utensils
} from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export const MealPlanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { plan, addRecipeToPlan, removeRecipeFromPlan, addAllToShoppingList, clearPlan } = useMealPlanner();
  const { savedRecipes } = useSavedRecipes();
  
  const [showSelector, setShowSelector] = useState<{ day: string; type: MealType } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<Recipe>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'search'>('saved');
  const [addingToShoppingList, setAddingToShoppingList] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchRecipesByName(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectRecipe = async (recipe: Partial<Recipe>) => {
    if (!showSelector) return;
    
    // If it's a partial recipe (from search), fetch full recipe to get ingredients
    let fullRecipe = recipe;
    if (!recipe.ingredients && recipe.id) {
      const fetched = await getRecipeById(recipe.id);
      if (fetched) fullRecipe = fetched;
    }
    
    await addRecipeToPlan(showSelector.day, showSelector.type, fullRecipe);
    setShowSelector(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddAllToShoppingList = async () => {
    setAddingToShoppingList(true);
    await addAllToShoppingList();
    setAddingToShoppingList(false);
    // Maybe show a success message
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Calendar size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('weekly_meal_planner')}</h1>
        </div>
        
        <button
          onClick={handleAddAllToShoppingList}
          disabled={Object.keys(plan).length === 0 || addingToShoppingList}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-text-app rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {addingToShoppingList ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />}
          {t('add_all_to_shopping_list')}
        </button>
      </div>

      <div className="grid gap-8">
        {DAYS.map(day => (
          <div key={day} className="space-y-4">
            <h2 className="text-xl font-bold text-text-app/60 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-[2px] bg-surface-app"></span>
              {t(day)}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {MEAL_TYPES.map(type => {
                const meal = plan[day]?.[type];
                return (
                  <div 
                    key={`${day}-${type}`} 
                    className={`relative p-4 rounded-3xl border-2 transition-all duration-300 ${
                      meal 
                        ? 'bg-surface-app border-transparent shadow-md' 
                        : 'bg-surface-app/50 border-dashed border-border-app hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-tighter text-text-app/60">
                        {t(type)}
                      </span>
                      {meal && (
                        <button 
                          onClick={() => removeRecipeFromPlan(day, type)}
                          className="p-1.5 text-text-app/60 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {meal ? (
                      <div className="flex gap-3">
                        <img 
                          src={meal.thumbnail} 
                          alt={meal.title} 
                          className="w-16 h-16 rounded-xl object-cover shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm line-clamp-2 leading-tight mb-1">
                            {meal.title}
                          </h3>
                          <Link 
                            to={`/recipe/${meal.id}`}
                            className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline w-fit"
                          >
                            {t('show_more')} <ChevronRight size={10} />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowSelector({ day, type })}
                        className="w-full py-4 flex flex-col items-center justify-center gap-2 text-text-app/60 hover:text-primary transition-colors group"
                      >
                        <div className="p-2 bg-surface-app rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          <Plus size={20} />
                        </div>
                        <span className="text-xs font-bold">{t('add_recipe')}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-app rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-border-app flex justify-between items-center bg-surface-app/50">
              <div>
                <h3 className="text-2xl font-black">{t('select_recipe')}</h3>
                <p className="text-sm text-text-app/50 uppercase font-bold tracking-widest mt-1">
                  {t(showSelector.day)} · {t(showSelector.type)}
                </p>
              </div>
              <button 
                onClick={() => { setShowSelector(null); setSearchQuery(''); setSearchResults([]); }} 
                className="p-3 rounded-full hover:bg-surface-app transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 border-b border-border-app flex gap-2">
              <button 
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'saved' 
                    ? 'bg-primary text-text-app shadow-lg shadow-primary/20' 
                    : 'bg-surface-app text-text-app/50'
                }`}
              >
                {t('saved_recipes')}
              </button>
              <button 
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'search' 
                    ? 'bg-primary text-text-app shadow-lg shadow-primary/20' 
                    : 'bg-surface-app text-text-app/50'
                }`}
              >
                {t('search_recipes')}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'saved' ? (
                <div className="grid grid-cols-2 gap-4">
                  {savedRecipes.length > 0 ? (
                    savedRecipes.map(recipe => (
                      <button
                        key={recipe.id}
                        onClick={() => handleSelectRecipe(recipe)}
                        className="group relative flex flex-col text-left bg-surface-app rounded-3xl overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all"
                      >
                        <img src={recipe.thumbnail} className="w-full h-32 object-cover" />
                        <div className="p-4">
                          <h4 className="font-bold text-sm line-clamp-1">{recipe.title}</h4>
                        </div>
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Plus className="text-primary" size={32} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 py-12 text-center text-text-app/60">
                      <Bookmark className="mx-auto mb-4 opacity-20" size={48} />
                      <p>{t('no_saved')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <form onSubmit={handleSearch} className="relative">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('search_placeholder')}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-app border-2 border-transparent focus:border-primary/30 transition-all outline-none"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-app/60" size={20} />
                  </form>

                  {isSearching ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {searchResults.map(recipe => (
                        <button
                          key={recipe.id}
                          onClick={() => handleSelectRecipe(recipe)}
                          className="group relative flex flex-col text-left bg-surface-app rounded-3xl overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all"
                        >
                          <img src={recipe.thumbnail} className="w-full h-32 object-cover" />
                          <div className="p-4">
                            <h4 className="font-bold text-sm line-clamp-1">{recipe.title}</h4>
                          </div>
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Plus className="text-primary" size={32} />
                          </div>
                        </button>
                      ))}
                      {searchResults.length === 0 && searchQuery && (
                        <div className="col-span-2 py-12 text-center text-text-app/60">
                          <Utensils className="mx-auto mb-4 opacity-20" size={48} />
                          <p>{t('no_results_found')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
