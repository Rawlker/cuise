import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSavedRecipes } from '../context/SavedRecipesContext';
import { RecipeCard } from '../components/RecipeCard';
import { Bookmark } from 'lucide-react';

export const SavedRecipes: React.FC = () => {
  const { t } = useTranslation();
  const { savedRecipes } = useSavedRecipes();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Bookmark size={28} className="text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('saved')}</h1>
      </div>

      {savedRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
          <div className="w-20 h-20 bg-surface-app rounded-full flex items-center justify-center text-gray-300">
            <Bookmark size={40} />
          </div>
          <p className="text-text-app/60 font-medium italic">
            {t('no_saved')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {savedRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};
