import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../types';
import { Bookmark, BookmarkCheck, Link as LinkIcon, X, Utensils } from 'lucide-react';
import { useSavedRecipes } from '../context/SavedRecipesContext';
import { useTranslation } from 'react-i18next';

interface RecipeCardProps {
  recipe: Partial<Recipe>;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { t } = useTranslation();
  const { isSaved, saveRecipe, removeRecipe } = useSavedRecipes();
  const [imageError, setImageError] = useState(false);
  
  const recipeId = recipe.id;
  const saved = recipeId ? isSaved(recipeId) : false;
  const isImported = recipe.isImported;

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recipeId) return;

    if (saved) {
      await removeRecipe(recipeId);
    } else {
      await saveRecipe(recipe as Recipe);
    }
  };

  if (!recipeId) return null;

  return (
    <Link to={`/recipe/${recipeId}`} className="group relative block overflow-hidden rounded-[2rem] bg-surface-app shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border-app">
      <div className="relative h-56 overflow-hidden bg-bg-app flex items-center justify-center">
        {!imageError && recipe.thumbnail ? (
          <img 
            src={recipe.thumbnail} 
            alt={recipe.title} 
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-text-app/20">
            <Utensils size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {isImported && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-bg-app/50 backdrop-blur-md rounded-full text-text-app text-[10px] font-black uppercase tracking-widest border border-border-app">
            <LinkIcon size={12} />
            {t('imported_recipe')}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-text-app line-clamp-2 leading-tight group-hover:text-primary transition-colors">{recipe.title || t('imported_recipe')}</h3>
      </div>
      <button 
        onClick={handleToggleSave}
        className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95 z-10 ${
          saved ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-surface-app/90 text-text-app/40'
        }`}
        title={saved ? t('remove_recipe') : t('save_recipe')}
      >
        {saved ? <X size={20} /> : <Bookmark size={20} />}
      </button>
    </Link>
  );
};
