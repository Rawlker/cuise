export const INGREDIENT_MAP: Record<string, string> = {
  // Common ingredients (ES -> EN for search)
  'pollo': 'chicken',
  'carne': 'beef',
  'cerdo': 'pork',
  'pescado': 'fish',
  'huevo': 'egg',
  'leche': 'milk',
  'harina': 'flour',
  'azucar': 'sugar',
  'sal': 'salt',
  'aceite': 'oil',
  'cebolla': 'onion',
  'ajo': 'garlic',
  'papa': 'potato',
  'patata': 'potato',
  'arroz': 'rice',
  'tomate': 'tomato',
  'zanahoria': 'carrot',
  'limon': 'lemon',
  'mantequilla': 'butter',
  'queso': 'cheese',
  'pan': 'bread',
  'pasta': 'pasta',
  'frijoles': 'beans',
  'lentejas': 'lentils',
  'garbanzos': 'chickpeas',
  'espinaca': 'spinach',
  'brocoli': 'broccoli',
  'manzana': 'apple',
  'platano': 'banana',
  'fresa': 'strawberry',
  'uva': 'grape',
  'naranja': 'orange',
  'agua': 'water',
  'vino': 'wine',
  'cerveza': 'beer',
  'miel': 'honey',
  'yogur': 'yogurt',
  'nata': 'cream',
  'chocolate': 'chocolate',
  'cafe': 'coffee',
  'te': 'tea',
};

// EN -> ES for display
export const INGREDIENT_DISPLAY_MAP: Record<string, string> = {
  'Chicken': 'Pollo',
  'Beef': 'Res',
  'Pork': 'Cerdo',
  'Fish': 'Pescado',
  'Egg': 'Huevo',
  'Milk': 'Leche',
  'Flour': 'Harina',
  'Sugar': 'Azúcar',
  'Salt': 'Sal',
  'Oil': 'Aceite',
  'Onion': 'Cebolla',
  'Garlic': 'Ajo',
  'Potato': 'Papa',
  'Rice': 'Arroz',
  'Tomato': 'Tomate',
  'Carrot': 'Zanahoria',
  'Lemon': 'Limón',
  'Butter': 'Mantequilla',
  'Cheese': 'Queso',
  'Bread': 'Pan',
  'Pasta': 'Pasta',
  'Beans': 'Frijoles',
  'Lentils': 'Lentejas',
  'Chickpeas': 'Garbanzos',
  'Spinach': 'Espinaca',
  'Broccoli': 'Brócoli',
  'Apple': 'Manzana',
  'Banana': 'Plátano',
  'Strawberry': 'Fresa',
  'Orange': 'Naranja',
  'Water': 'Agua',
  'Wine': 'Vino',
  'Honey': 'Miel',
  'Yogurt': 'Yogur',
  'Cream': 'Nata',
  'Chocolate': 'Chocolate',
  'Coffee': 'Café',
  'Tea': 'Té',
  'Pepper': 'Pimienta',
  'Parsley': 'Perejil',
  'Ginger': 'Jengibre',
  'Cinnamon': 'Canela',
  'Vanilla': 'Vainilla',
};

export const AREA_MAP: Record<string, string> = {
  'American': 'Americana',
  'British': 'Británica',
  'Canadian': 'Canadiense',
  'Chinese': 'China',
  'Croatian': 'Croata',
  'Dutch': 'Holandesa',
  'Egyptian': 'Egipcia',
  'French': 'Francesa',
  'Greek': 'Griega',
  'Indian': 'India',
  'Irish': 'Irlandesa',
  'Italian': 'Italiana',
  'Jamaican': 'Jamaicana',
  'Japanese': 'Japonesa',
  'Kenyan': 'Keniata',
  'Malaysian': 'Malasia',
  'Mexican': 'Mexicana',
  'Moroccan': 'Marroquí',
  'Polish': 'Polaca',
  'Portuguese': 'Portuguesa',
  'Russian': 'Rusa',
  'Spanish': 'Española',
  'Thai': 'Tailandesa',
  'Tunisian': 'Tunecina',
  'Turkish': 'Turca',
  'Unknown': 'Desconocida',
  'Vietnamese': 'Vietnamita',
};

export const CATEGORY_MAP: Record<string, string> = {
  'Beef': 'Res',
  'Chicken': 'Pollo',
  'Breakfast': 'Desayuno',
  'Dessert': 'Postre',
  'Goat': 'Cabra',
  'Lamb': 'Cordero',
  'Miscellaneous': 'Varios',
  'Pasta': 'Pasta',
  'Pork': 'Cerdo',
  'Seafood': 'Mariscos',
  'Side': 'Acompañamiento',
  'Starter': 'Entrada',
  'Vegan': 'Vegano',
  'Vegetarian': 'Vegetariano',
};

export const translateIngredientToEN = (ingredient: string): string => {
  const lower = ingredient.toLowerCase().trim();
  return INGREDIENT_MAP[lower] || lower;
};

export const translateIngredientToES = (ingredient: string, lang: string): string => {
  if (lang === 'en') return ingredient;
  return INGREDIENT_DISPLAY_MAP[ingredient] || ingredient;
};

export const translateArea = (area: string, lang: string): string => {
  if (lang === 'en') return area;
  return AREA_MAP[area] || area;
};

export const translateCategory = (category: string, lang: string): string => {
  if (lang === 'en') return category;
  return CATEGORY_MAP[category] || category;
};

const COMMON_COOKING_TERMS: Record<string, string> = {
  'Chicken': 'Pollo',
  'Beef': 'Res',
  'Pork': 'Cerdo',
  'Salad': 'Ensalada',
  'Soup': 'Sopa',
  'Cake': 'Pastel',
  'Pie': 'Tarta',
  'Roast': 'Asado',
  'Fried': 'Frito',
  'Grilled': 'A la parrilla',
  'With': 'con',
  'And': 'y',
  'Spicy': 'Picante',
  'Sweet': 'Dulce',
  'Bread': 'Pan',
  'Rice': 'Arroz',
  'Pasta': 'Pasta',
  'Curry': 'Curry',
  'Stew': 'Estofado',
  'Roasted': 'Rostizado',
  'Boil': 'Hervir',
  'Cook': 'Cocinar',
  'Mix': 'Mezclar',
  'Heat': 'Calentar',
  'Add': 'Añadir',
  'Serve': 'Servir',
  'Bake': 'Hornear',
  'Fry': 'Freír',
  'Chop': 'Picar',
  'Peel': 'Pelar',
  'Stir': 'Remover',
  'Drain': 'Escurrir',
  'Season': 'Sazonar',
  'Until': 'Hasta que',
  'Golden': 'Dorado',
  'Brown': 'Marrón',
  'Salt': 'Sal',
  'Pepper': 'Pimienta',
  'Oil': 'Aceite',
  'Butter': 'Mantequilla',
  'Water': 'Agua',
  'Medium heat': 'fuego medio',
  'High heat': 'fuego alto',
  'Low heat': 'fuego bajo',
  'Minutes': 'minutos',
  'Seconds': 'segundos',
  'Degree': 'grado',
  'Oven': 'horno',
  'Pan': 'sartén',
  'Pot': 'olla',
  'Bowl': 'bol',
};

export const translateRecipeTitle = (title: string, lang: string): string => {
  if (lang === 'en') return title;
  
  let translated = title;
  Object.entries(COMMON_COOKING_TERMS).forEach(([en, es]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, es);
  });

  return translated;
};

export const translateInstructions = (instructions: string, lang: string): string => {
  if (lang === 'en' || !instructions) return instructions;
  
  let translated = instructions;
  
  // Replace sentences/common patterns
  const patterns: [RegExp, string][] = [
    [/Preheat the oven to/gi, 'Precalentar el horno a'],
    [/In a large bowl/gi, 'En un bol grande'],
    [/In a large pot/gi, 'En una olla grande'],
    [/In a small bowl/gi, 'En un bol pequeño'],
    [/Season with salt and pepper/gi, 'Sazonar con sal y pimienta'],
    [/Heat the oil in a/gi, 'Calentar el aceite en una'],
    [/Bring to a boil/gi, 'Llevar a ebullición'],
    [/Reduce heat and simmer/gi, 'Reducir el fuego y cocinar a fuego lento'],
    [/Cook for about (\d+) minutes/gi, 'Cocinar por unos $1 minutos'],
    [/until golden brown/gi, 'hasta que esté dorado'],
  ];

  patterns.forEach(([reg, rep]) => {
    translated = translated.replace(reg, rep);
  });

  // Word by word fallback for common terms
  Object.entries(COMMON_COOKING_TERMS).forEach(([en, es]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, es);
  });

  return translated;
};
