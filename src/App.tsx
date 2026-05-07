import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SavedRecipesProvider } from './context/SavedRecipesContext';
import { FridgeProvider } from './context/FridgeContext';
import { ShoppingListProvider } from './context/ShoppingListContext';
import { MealPlannerProvider } from './context/MealPlannerContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navigation';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { RecipeDetail } from './pages/RecipeDetail';
import { SavedRecipes } from './pages/SavedRecipes';
import { MyFridge } from './pages/MyFridge';
import { ShoppingList } from './pages/ShoppingList';
import { MealPlanner } from './pages/MealPlanner';
import { FeedbackButton } from './components/FeedbackButton';
import './i18n';

function App() {
  return (
    <ThemeProvider>
      <SavedRecipesProvider>
        <FridgeProvider>
          <ShoppingListProvider>
            <MealPlannerProvider>
              <Router>
                <div className="min-h-screen bg-bg-app text-text-app max-w-4xl mx-auto md:shadow-2xl md:my-8 md:rounded-3xl overflow-hidden flex flex-col relative border-x border-border-app">
                  <Navbar />
                  <main className="px-6 py-8 flex-grow overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/fridge" element={<MyFridge />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/recipe/:id" element={<RecipeDetail />} />
                      <Route path="/saved" element={<SavedRecipes />} />
                      <Route path="/shopping-list" element={<ShoppingList />} />
                      <Route path="/planner" element={<MealPlanner />} />
                    </Routes>
                  </main>
                  <FeedbackButton />
                  <footer className="px-6 py-8 border-t border-border-app text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded flex items-center justify-center shadow-lg rotate-3 overflow-hidden">
                        <img src="/favicon.svg" alt="" className="w-4 h-4 invert brightness-0" />
                      </div>
                      <span className="font-black tracking-tighter text-text-app uppercase italic">Cuise</span>
                    </div>
                    <p className="text-xs text-text-app font-medium opacity-40">
                      © {new Date().getFullYear()} · Made with <span className="text-red-500">♥</span>
                    </p>
                  </footer>
                </div>
              </Router>
            </MealPlannerProvider>
          </ShoppingListProvider>
        </FridgeProvider>
      </SavedRecipesProvider>
    </ThemeProvider>
  );
}

export default App;
