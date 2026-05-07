import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRecipeById } from '../api/meals';
import type { Recipe } from '../types';
import { ArrowLeft, ShoppingCart, Users, Bookmark, BookmarkCheck, Loader2, Play, Link as LinkIcon, Utensils, Share2, ChefHat, Check } from 'lucide-react';
import { scaleMeasure, getShoppingLink, getSubstitutes } from '../utils/helpers';
import { translateCategory } from '../utils/translations';
import { Timer } from '../components/Timer';
import { CookingMode } from '../components/CookingMode';
import { useSavedRecipes } from '../context/SavedRecipesContext';
import { useFridge } from '../context/FridgeContext';
import { useShoppingList } from '../context/ShoppingListContext';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isSaved, saveRecipe, removeRecipe } = useSavedRecipes();
  const { hasIngredient } = useFridge();
  const { addIngredients } = useShoppingList();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [portions, setPortions] = useState(1);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isCooked, setIsCooked] = useState(false);

  useEffect(() => {
    if (id) {
      getRecipeById(id).then(setRecipe);
      const cooked = JSON.parse(localStorage.getItem('cuise-cooked') || '[]');
      setIsCooked(cooked.includes(id));
    }
  }, [id]);

  if (!recipe) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  if (isCooking) {
    return <CookingMode recipe={recipe} onClose={() => setIsCooking(false)} />;
  }

  const saved = isSaved(recipe.id);

  const toggleSave = () => {
    if (saved) {
      removeRecipe(recipe.id);
    } else {
      saveRecipe(recipe);
    }
  };

  const handleAddToShoppingList = async () => {
    setIsAdding(true);
    // Filter ingredients that are NOT in the fridge
    const neededIngredients = recipe.ingredients.filter(ing => !hasIngredient(ing.name));
    await addIngredients(neededIngredients);
    setTimeout(() => setIsAdding(false), 2000);
  };

  const handleShare = async () => {
    if (!recipe) return;
    const shareData = {
      title: recipe.title,
      text: recipe.title,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleMarkAsCooked = () => {
    if (!recipe) return;
    const cooked = JSON.parse(localStorage.getItem('cuise-cooked') || '[]');
    let newCooked;
    if (isCooked) {
      newCooked = cooked.filter((cid: string) => cid !== recipe.id);
    } else {
      newCooked = [...cooked, recipe.id];
    }
    localStorage.setItem('cuise-cooked', JSON.stringify(newCooked));
    setIsCooked(!isCooked);
  };

  const translatedCategory = translateCategory(recipe.category, i18n.language);

  return (
    <div className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 rounded-full bg-surface-app shadow-md text-text-app/50 hover:text-primary transition-all duration-300 hover:scale-110"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={toggleSave}
          className="p-3 rounded-full bg-surface-app shadow-md transition-all duration-300 hover:scale-110"
        >
          {saved ? <BookmarkCheck size={24} className="text-primary" /> : <Bookmark size={24} className="text-text-app/60" />}
        </button>
      </div>

      <div className="relative mb-8 group bg-surface-app rounded-[2.5rem] overflow-hidden aspect-video flex items-center justify-center">
        {!imageError && recipe.thumbnail ? (
          <img 
            src={recipe.thumbnail} 
            alt={recipe.title} 
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-text-app/20">
            <Utensils size={80} />
          </div>
        )}
        <div className="absolute top-4 right-4 px-4 py-2 bg-surface-app/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-border-app">
          {recipe.area}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">{recipe.title}</h1>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="p-3 rounded-2xl bg-surface-app shadow-md text-text-app/60 hover:text-primary transition-all active:scale-95"
              title={t('share')}
            >
              <Share2 size={24} />
            </button>
            <button 
              onClick={handleMarkAsCooked}
              className={`p-3 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                isCooked ? 'bg-green-500 text-white' : 'bg-surface-app text-text-app/60 hover:text-primary'
              }`}
              title={t('mark_as_cooked')}
            >
              {isCooked ? <Check size={24} /> : <ChefHat size={24} />}
              <span className="hidden sm:inline font-bold text-sm">
                {isCooked ? t('cooked') : t('mark_as_cooked')}
              </span>
            </button>
          </div>
        </div>

        {showToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-text-app text-bg-app px-6 py-3 rounded-2xl font-bold shadow-2xl">
              {t('link_copied')}
            </div>
          </div>
        )}
        {recipe.isImported && recipe.sourceUrl && (
          <a 
            href={recipe.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-bold text-primary flex items-center gap-2 hover:underline mb-2"
          >
            <LinkIcon size={16} />
            {new URL(recipe.sourceUrl).hostname}
          </a>
        )}
        {i18n.language === 'es' && !recipe.isImported && (
          <p className="text-xs font-medium text-primary opacity-80 italic">
            {t('language_notice')}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6 mb-10 p-6 bg-surface-app rounded-[2rem] border border-border-app shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bg-app rounded-xl shadow-sm">
            <Users size={20} className="text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPortions(Math.max(1, portions - 1))} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-app shadow-md font-bold hover:bg-primary hover:text-text-app transition border border-border-app"
            >-</button>
            <span className="font-bold text-lg min-w-[1ch] text-center">{portions}</span>
            <button 
              onClick={() => setPortions(portions + 1)} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-app shadow-md font-bold hover:bg-primary hover:text-text-app transition border border-border-app"
            >+</button>
          </div>
        </div>
        <div className="h-8 w-[1px] bg-border-app"></div>
        <div className="text-sm font-bold text-primary uppercase tracking-widest">{translatedCategory}</div>
      </div>

      {recipe.nutrition && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
            <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">N</span>
            {t('nutrition')}
            <span className="text-sm font-normal text-text-app/60 ml-auto">
              {t('per_portion')} ({portions})
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-surface-app p-5 rounded-3xl shadow-sm border border-border-app flex flex-col items-center text-center group hover:border-primary/30 transition-all">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Utensils size={20} />
              </div>
              <div className="text-2xl font-black">{recipe.nutrition.calories * portions}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-app/60">{t('calories')}</div>
            </div>
            
            <div className="bg-surface-app p-5 rounded-3xl shadow-sm border border-border-app flex flex-col items-center text-center group hover:border-primary/30 transition-all">
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className="font-black text-xs">P</div>
              </div>
              <div className="text-2xl font-black">{recipe.nutrition.protein * portions}g</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-app/60">{t('protein')}</div>
              <div className="w-full bg-bg-app h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, (recipe.nutrition.protein * portions) / 0.5)}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-app p-5 rounded-3xl shadow-sm border border-border-app flex flex-col items-center text-center group hover:border-primary/30 transition-all">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className="font-black text-xs">C</div>
              </div>
              <div className="text-2xl font-black">{recipe.nutrition.carbs * portions}g</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-app/60">{t('carbs')}</div>
              <div className="w-full bg-bg-app h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (recipe.nutrition.carbs * portions) / 1.5)}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-app p-5 rounded-3xl shadow-sm border border-border-app flex flex-col items-center text-center group hover:border-primary/30 transition-all">
              <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className="font-black text-xs">F</div>
              </div>
              <div className="text-2xl font-black">{recipe.nutrition.fat * portions}g</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-app/60">{t('fat')}</div>
              <div className="w-full bg-bg-app h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-yellow-500 h-full" style={{ width: `${Math.min(100, (recipe.nutrition.fat * portions) / 0.3)}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-app p-5 rounded-3xl shadow-sm border border-border-app flex flex-col items-center text-center group hover:border-primary/30 transition-all">
              <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className="font-black text-xs">Fi</div>
              </div>
              <div className="text-2xl font-black">{recipe.nutrition.fiber * portions}g</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-app/60">{t('fiber')}</div>
              <div className="w-full bg-bg-app h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${Math.min(100, (recipe.nutrition.fiber * portions) / 0.1)}%` }}></div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">01</span>
            {t('ingredients')}
          </h2>
          <button
            onClick={handleAddToShoppingList}
            disabled={isAdding}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg ${
              isAdding 
                ? 'bg-green-500 text-text-app shadow-green-200' 
                : 'bg-primary text-text-app shadow-primary/20 hover:scale-105 active:scale-95'
            }`}
          >
            <ShoppingCart size={18} />
            {isAdding ? t('added_to_shopping_list') : t('add_to_shopping_list')}
          </button>
        </div>
        <div className="grid gap-4">
          {recipe.ingredients.map((ing, index) => {
            const hasIt = hasIngredient(ing.name);
            return (
              <div 
                key={index} 
                className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${
                  hasIt 
                    ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' 
                    : 'bg-surface-app/40 border-transparent hover:bg-surface-app hover:border-primary/20'
                }`}
                onClick={() => setSelectedIngredient(selectedIngredient === ing.name ? null : ing.name)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 p-2 bg-bg-app rounded-xl shadow-inner group-hover:scale-110 transition-transform flex items-center justify-center">
                    <img 
                      src={ing.image} 
                      alt={ing.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://www.themealdb.com/images/ingredients/Lime.png';
                        (e.target as HTMLImageElement).classList.add('opacity-20');
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-text-app flex items-center gap-2">
                      {ing.name}
                      {hasIt && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>}
                    </div>
                    <div className="text-sm text-text-app/50 font-medium">{scaleMeasure(ing.measure, portions)}</div>
                  </div>
                </div>
                
                {!hasIt && (
                  <a 
                    href={getShoppingLink(ing.name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-text-app rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ShoppingCart size={14} />
                    {t('buy')}
                  </a>
                )}
                
                {selectedIngredient === ing.name && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-surface-app p-6 rounded-3xl shadow-2xl border border-border-app animate-in fade-in zoom-in-95 duration-200">
                    <h4 className="font-bold text-lg mb-4 text-primary">{t('substitutes')}</h4>
                    <ul className="space-y-3">
                      {getSubstitutes(ing.name).length > 0 ? (
                        getSubstitutes(ing.name).map(s => (
                          <li key={s} className="flex items-center gap-3 text-text-app/60 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                            {s}
                          </li>
                        ))
                      ) : (
                        <li className="text-text-app/40 italic">{t('no_substitutes')}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">02</span>
            {t('instructions')}
          </h2>
          <button
            onClick={() => setIsCooking(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-text-app rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Play size={18} fill="currentColor" />
            {t('start_cooking')}
          </button>
        </div>
        <div className="mb-10">
          <Timer initialMinutes={10} />
        </div>
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-lg text-text-app/80 leading-relaxed font-medium">
          {recipe.instructions}
        </div>
      </section>
    </div>
  );
};
