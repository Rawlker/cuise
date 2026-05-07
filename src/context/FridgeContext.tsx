import React, { createContext, useContext, useState, useEffect } from 'react';

interface FridgeContextType {
  myIngredients: string[];
  addIngredient: (ing: string) => void;
  removeIngredient: (ing: string) => void;
  hasIngredient: (ing: string) => boolean;
}

const FridgeContext = createContext<FridgeContextType | undefined>(undefined);

export const FridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myIngredients, setMyIngredients] = useState<string[]>(() => {
    const saved = localStorage.getItem('my_fridge_ingredients');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('my_fridge_ingredients', JSON.stringify(myIngredients));
  }, [myIngredients]);

  const addIngredient = (ing: string) => {
    if (!myIngredients.some(i => i.toLowerCase() === ing.toLowerCase())) {
      setMyIngredients([...myIngredients, ing]);
    }
  };

  const removeIngredient = (ing: string) => {
    setMyIngredients(myIngredients.filter(i => i.toLowerCase() !== ing.toLowerCase()));
  };

  const hasIngredient = (ing: string) => {
    const lowerIng = ing.toLowerCase();
    return myIngredients.some(i => {
      const lowerMy = i.toLowerCase();
      return lowerIng.includes(lowerMy) || lowerMy.includes(lowerIng);
    });
  };

  return (
    <FridgeContext.Provider value={{ myIngredients, addIngredient, removeIngredient, hasIngredient }}>
      {children}
    </FridgeContext.Provider>
  );
};

export const useFridge = () => {
  const context = useContext(FridgeContext);
  if (!context) {
    throw new Error('useFridge must be used within a FridgeProvider');
  }
  return context;
};
