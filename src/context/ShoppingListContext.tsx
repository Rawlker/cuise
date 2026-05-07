import React, { createContext, useContext, useEffect, useState } from 'react';
import { get, set } from 'idb-keyval';
import type { ShoppingListItem, RecipeIngredient } from '../types';

interface ShoppingListContextType {
  items: ShoppingListItem[];
  addIngredients: (ingredients: RecipeIngredient[]) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearList: () => Promise<void>;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

const STORAGE_KEY = 'shopping-list';

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      const saved = await get<ShoppingListItem[]>(STORAGE_KEY);
      if (saved) setItems(saved);
    };
    loadItems();
  }, []);

  const saveItems = async (newItems: ShoppingListItem[]) => {
    setItems(newItems);
    await set(STORAGE_KEY, newItems);
  };

  const consolidateIngredients = (currentItems: ShoppingListItem[], newIngredients: RecipeIngredient[]): ShoppingListItem[] => {
    const result = [...currentItems];

    newIngredients.forEach(ing => {
      // Find if ingredient already exists (case insensitive)
      const existingIndex = result.findIndex(item => 
        item.name.toLowerCase() === ing.name.toLowerCase() && !item.bought
      );

      if (existingIndex > -1) {
        // Simple consolidation: just append the measure if it's different, or keep it if same
        // For a more advanced version, we could parse quantities, but let's keep it simple for now
        const existing = result[existingIndex];
        if (existing.measure !== ing.measure) {
          existing.measure = `${existing.measure}, ${ing.measure}`;
        }
      } else {
        result.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          name: ing.name,
          measure: ing.measure,
          bought: false
        });
      }
    });

    return result;
  };

  const addIngredients = async (ingredients: RecipeIngredient[]) => {
    const newItems = consolidateIngredients(items, ingredients);
    await saveItems(newItems);
  };

  const toggleItem = async (id: string) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, bought: !item.bought } : item
    );
    // Sort: unbought first, then bought
    const sortedItems = [
      ...newItems.filter(i => !i.bought),
      ...newItems.filter(i => i.bought)
    ];
    await saveItems(sortedItems);
  };

  const removeItem = async (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    await saveItems(newItems);
  };

  const clearList = async () => {
    await saveItems([]);
  };

  return (
    <ShoppingListContext.Provider value={{ items, addIngredients, toggleItem, removeItem, clearList }}>
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) throw new Error('useShoppingList must be used within a ShoppingListProvider');
  return context;
};
