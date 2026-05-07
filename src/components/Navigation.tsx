import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Bookmark, Search, Globe, Refrigerator, ShoppingCart, Calendar, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useShoppingList } from '../context/ShoppingListContext';
import { useTheme, type Theme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { items } = useShoppingList();
  const { theme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);
  const unboughtCount = items.filter(i => !i.bought).length;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-app/80 backdrop-blur-xl border-b border-border-app shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-0 transition-transform overflow-hidden">
            <img src="/favicon.svg" alt="Cuise Logo" className="w-8 h-8 invert brightness-0" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-text-app uppercase italic hidden sm:block">Cuise</h1>
        </Link>

        <nav className="flex items-center gap-1 md:gap-4">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
            {({ isActive }) => (
              <>
                <Home size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-widest hidden sm:block whitespace-nowrap">{t('home')}</span>
              </>
            )}
          </NavLink>
          <NavLink to="/fridge" className={({ isActive }) => `flex items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
            {({ isActive }) => (
              <>
                <Refrigerator size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-widest hidden sm:block whitespace-nowrap">{t('my_fridge')}</span>
              </>
            )}
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `flex items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
            {({ isActive }) => (
              <>
                <Search size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-widest hidden sm:block whitespace-nowrap">{t('search')}</span>
              </>
            )}
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => `flex items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
            {({ isActive }) => (
              <>
                <Bookmark size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-widest hidden sm:block whitespace-nowrap">{t('saved')}</span>
              </>
            )}
          </NavLink>
          <NavLink to="/planner" className={({ isActive }) => `flex items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
            {({ isActive }) => (
              <>
                <Calendar size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-widest hidden sm:block whitespace-nowrap">{t('meal_planner')}</span>
              </>
            )}
          </NavLink>
          <NavLink to="/shopping-list" className={({ isActive }) => `flex items-center gap-1 transition-all duration-300 relative ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
            {({ isActive }) => (
              <>
                <div className="relative">
                  <ShoppingCart size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {unboughtCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border-[1.5px] border-white dark:border-gray-900">
                      {unboughtCount}
                    </span>
                  )}
                </div>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-widest hidden sm:block whitespace-nowrap">{t('shopping_list')}</span>
              </>
            )}
          </NavLink>
          <button onClick={toggleLanguage} className="flex items-center gap-1 text-gray-400 hover:text-primary transition-all duration-300 ml-1">
            <Globe size={18} />
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-widest whitespace-nowrap">{i18n.language}</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1 text-gray-400 hover:text-primary transition-all duration-300 ml-1"
            >
              <Palette size={18} />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-widest hidden sm:block">Theme</span>
            </button>
            
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-surface-app border border-border-app rounded-2xl shadow-xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                {(['dark', 'light', 'kitchen'] as Theme[]).map((tValue) => (
                  <button
                    key={tValue}
                    onClick={() => {
                      setTheme(tValue);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      theme === tValue ? 'bg-primary text-white' : 'text-text-app/60 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {tValue}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export const Header: React.FC = () => {
  return null; // Integrated into Navbar
};
