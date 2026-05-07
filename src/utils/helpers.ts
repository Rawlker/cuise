export const scaleMeasure = (measure: string, factor: number): string => {
  if (factor === 1) return measure;

  // Simple regex to find numbers (including fractions like 1/2)
  const numberRegex = /(\d+(\.\d+)?|\d+\/\d+)/g;
  
  return measure.replace(numberRegex, (match) => {
    let value: number;
    if (match.includes('/')) {
      const [num, den] = match.split('/').map(Number);
      value = num / den;
    } else {
      value = parseFloat(match);
    }
    
    const scaled = value * factor;
    // Format to 2 decimal places if not integer, otherwise as integer
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, "");
  });
};

export const getShoppingLink = (ingredient: string): string => {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(ingredient)}`;
};

export const getSubstitutes = (ingredient: string): string[] => {
  const subsMap: Record<string, string[]> = {
    'Milk': ['Almond Milk', 'Soy Milk', 'Oat Milk'],
    'Egg': ['Applesauce', 'Flaxseed Meal', 'Banana'],
    'Butter': ['Margarine', 'Coconut Oil', 'Applesauce'],
    'Flour': ['Almond Flour', 'Gluten-free Flour Mix'],
    'Sugar': ['Honey', 'Maple Syrup', 'Stevia'],
  };
  
  return subsMap[ingredient] || [];
};
