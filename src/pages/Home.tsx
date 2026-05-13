import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getRandomRecipe, getCategories, getRecipesByCategory } from '../api/meals';
import type { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { Sparkles, LayoutGrid, ChevronRight, Loader2, Calendar, ShoppingCart } from 'lucide-react';
import { translateCategory } from '../utils/translations';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [allRecipes, setAllRecipes] = useState<Partial<Recipe>[]>([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRandomRecipe().then(setRandomRecipe);
    getCategories().then(cats => {
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      setVisibleCount(8);
      getRecipesByCategory(selectedCategory).then(data => {
        setAllRecipes(data);
        setLoading(false);
      });
    }
  }, [selectedCategory]);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  const displayedRecipes = allRecipes.slice(0, visibleCount);
  const hasMore = visibleCount < allRecipes.length;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Quick Access / Meal Planner */}
      <section className="grid md:grid-cols-2 gap-4">
        <Link to="/planner" className="flex items-center gap-6 p-6 bg-surface-app rounded-[2.5rem] border border-border-app hover:scale-[1.02] transition-all group">
          <div className="p-4 bg-bg-app rounded-2xl shadow-sm text-primary group-hover:scale-110 transition-transform">
            <Calendar size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-app">{t('meal_planner')}</h2>
            <p className="text-sm text-text-app/60 font-medium">{t('weekly_meal_planner')}</p>
          </div>
          <ChevronRight className="ml-auto text-primary group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link to="/shopping-list" className="flex items-center gap-6 p-6 bg-surface-app rounded-[2.5rem] border border-border-app hover:scale-[1.02] transition-all group">
          <div className="p-4 bg-bg-app rounded-2xl shadow-sm text-primary group-hover:scale-110 transition-transform">
            <ShoppingCart size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-app">{t('shopping_list')}</h2>
            <p className="text-sm text-text-app/60 font-medium">{t('buy')}</p>
          </div>
          <ChevronRight className="ml-auto text-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Hero / Random */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={22} className="text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('random')}</h2>
        </div>
        {randomRecipe && (
          <div className="md:grid md:grid-cols-2 gap-8 items-center bg-surface-app p-6 rounded-3xl border border-border-app">
            <RecipeCard recipe={randomRecipe} />
            <div className="hidden md:block">
              <h3 className="text-2xl font-bold mb-1 text-text-app">{randomRecipe.title}</h3>
              {i18n.language === 'es' && (
                <p className="text-[10px] font-medium text-primary italic mb-4">
                  {t('language_notice')}
                </p>
              )}
              <p className="text-text-app/60 line-clamp-4 mb-6">{randomRecipe.instructions}</p>
              <div className="flex gap-2 flex-wrap">
                {randomRecipe.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-3 py-1 bg-bg-app rounded-full text-xs font-medium shadow-sm">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutGrid size={22} className="text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-text-app">{t('categories')}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full transition-all duration-300 font-bold text-sm ${
                selectedCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                  : 'bg-surface-app text-text-app/60 hover:bg-surface-app/80'
              }`}
            >
              {translateCategory(cat, i18n.language)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {displayedRecipes.map((recipe: Partial<Recipe>) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <button 
            onClick={handleShowMore}
            className="w-full mt-10 py-4 bg-surface-app rounded-2xl text-text-app/60 font-medium hover:bg-surface-app/80 transition flex items-center justify-center gap-2 group border border-border-app"
          >
            {t('show_more')}
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </section>
    </div>
  );
};
