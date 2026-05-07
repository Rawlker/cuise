import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { searchRecipesByIngredient, searchRecipesByName } from '../api/meals';
import type { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { Search as SearchIcon, Loader2, X, Link as LinkIcon, Download, CheckCircle2 } from 'lucide-react';
import { translateIngredientToEN } from '../utils/translations';
import { extractRecipeFromUrl } from '../utils/recipeExtractor';
import { useSavedRecipes } from '../context/SavedRecipesContext';

export const Search: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { saveRecipe } = useSavedRecipes();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Partial<Recipe>[]>([]);
  const [suggestions, setSuggestions] = useState<Partial<Recipe>[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Import from URL states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(false);
  const [importPreview, setImportPreview] = useState<Recipe | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        const translated = i18n.language === 'es' ? translateIngredientToEN(query) : query;
        const nameResults = await searchRecipesByName(translated);
        setSuggestions(nameResults.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, i18n.language]);

  const handleSearch = async (e?: React.FormEvent, searchQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;
    
    setLoading(true);
    setShowSuggestions(false);
    
    const translated = i18n.language === 'es' ? translateIngredientToEN(finalQuery) : finalQuery;
    
    // Search by both name and ingredient for better results
    const [nameResults, ingResults] = await Promise.all([
      searchRecipesByName(translated),
      searchRecipesByIngredient(translated)
    ]);
    
    // Combine and remove duplicates
    const combined = [...nameResults, ...ingResults];
    const unique = Array.from(new Map(combined.map(r => [r.id, r])).values());
    
    setResults(unique);
    setLoading(false);
  };

  const handleImport = async () => {
    if (!importUrl) return;
    setImporting(true);
    setImportError(false);
    setImportPreview(null);
    
    try {
      const recipe = await extractRecipeFromUrl(importUrl);
      if (recipe) {
        setImportPreview(recipe);
      } else {
        setImportError(true);
      }
    } catch (err) {
      setImportError(true);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (importPreview) {
      await saveRecipe(importPreview);
      setShowImportModal(false);
      setImportUrl('');
      setImportPreview(null);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <form onSubmit={handleSearch} className="relative z-20">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length > 2 && setShowSuggestions(true)}
              placeholder={t('search_placeholder')}
              className="w-full pl-14 pr-12 py-5 rounded-3xl bg-surface-app border-2 border-transparent focus:border-primary/30 shadow-xl focus:outline-none transition-all duration-300"
            />
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={24} />
            {query && (
              <button 
                type="button"
                onClick={() => { setQuery(''); setResults([]); setSuggestions([]); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-text-app/60 hover:text-text-app/80"
              >
                <X size={20} />
              </button>
            )}
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-app rounded-3xl shadow-2xl border border-border-app overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-200">
              {suggestions.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => {
                    setQuery(recipe.title!);
                    handleSearch(undefined, recipe.title);
                  }}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-primary/10 text-left transition"
                >
                  <img src={recipe.thumbnail} className="w-12 h-12 rounded-xl object-cover" />
                  <span className="font-medium">{recipe.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowImportModal(true)}
          className="bg-primary text-text-app px-8 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Download size={24} />
          {t('import_from_url')}
        </button>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-app rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-border-app flex justify-between items-center">
              <h3 className="text-2xl font-black">{t('import_from_url')}</h3>
              <button onClick={() => { setShowImportModal(false); setImportPreview(null); setImportError(false); }} className="p-2 rounded-full hover:bg-surface-app transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {!importPreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="url" 
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder={t('import_url_placeholder')}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-app border-2 border-transparent focus:border-primary/30 transition-all outline-none"
                    />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-app/60" size={20} />
                  </div>
                  
                  {importError && (
                    <p className="text-red-500 text-sm font-medium flex items-center gap-2">
                      <X size={16} /> {t('import_error')}
                    </p>
                  )}
                  
                  <button 
                    onClick={handleImport}
                    disabled={!importUrl || importing}
                    className="w-full py-4 bg-primary text-text-app rounded-2xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {importing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                    {t('import_button')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex gap-4">
                    <img src={importPreview.thumbnail} className="w-24 h-24 rounded-2xl object-cover shadow-md" alt="" />
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-1">{importPreview.title}</h4>
                      <p className="text-sm text-text-app/50">{importPreview.category}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-text-app/60 uppercase tracking-widest text-xs mb-3">{t('ingredients')}</h5>
                    <div className="flex flex-wrap gap-2">
                      {importPreview.ingredients.slice(0, 5).map((ing, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {ing.name}
                        </span>
                      ))}
                      {importPreview.ingredients.length > 5 && (
                        <span className="px-3 py-1 bg-surface-app text-text-app/50 rounded-full text-xs font-medium">
                          +{importPreview.ingredients.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleConfirmImport}
                    className="w-full py-4 bg-green-500 text-text-app rounded-2xl font-bold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    {t('import_confirm')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-text-app/60 font-medium">{t('loading')}</p>
        </div>
      ) : (
        <>
          {results.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold">{t('search_results')}</h2>
              <span className="px-3 py-1 bg-surface-app rounded-full text-xs text-text-app/50">{results.length}</span>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {results.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
