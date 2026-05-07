import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShoppingList } from '../context/ShoppingListContext';
import { Trash2, CheckCircle2, Circle, ShoppingBasket, X } from 'lucide-react';

export const ShoppingList: React.FC = () => {
  const { t } = useTranslation();
  const { items, toggleItem, removeItem, clearList } = useShoppingList();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">{t('shopping_list')}</h1>
          <p className="text-text-app/50 font-medium">
            {items.length > 0 
              ? t('items_remaining', { count: items.filter(i => !i.bought).length })
              : t('empty_shopping_list')}
          </p>
        </div>
        {items.length > 0 && (
          <button 
            onClick={clearList}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
            {t('clear_list')}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300 dark:text-gray-700">
          <ShoppingBasket size={80} strokeWidth={1} className="mb-4 opacity-20" />
          <p className="text-xl font-bold italic uppercase tracking-widest">{t('empty_shopping_list')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id}
              className={`group flex items-center justify-between p-4 rounded-[1.5rem] border-2 transition-all duration-300 ${
                item.bought 
                  ? 'bg-surface-app/30 border-transparent opacity-60' 
                  : 'bg-surface-app border-border-app shadow-sm hover:border-primary/30'
              }`}
            >
              <div 
                className="flex items-center gap-4 flex-grow cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                <div className={`transition-colors duration-300 ${item.bought ? 'text-green-500' : 'text-gray-300 group-hover:text-primary'}`}>
                  {item.bought ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <div>
                  <h3 className={`font-bold transition-all duration-300 ${item.bought ? 'line-through text-text-app/60' : 'text-text-app'}`}>
                    {item.name}
                  </h3>
                  <p className={`text-sm font-medium transition-all duration-300 ${item.bought ? 'text-gray-300' : 'text-text-app/50'}`}>
                    {item.measure}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => removeItem(item.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title={t('remove_item')}
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
