import type { NutritionAnalysis, NutritionGoals } from "@shared/schema";

export interface LocalMeal {
  id: string;
  name?: string;
  mealType: string;
  analysisData: NutritionAnalysis;
  imageUrl?: string;
  notes?: string;
  consumedAt: string; // ISO string
  createdAt: string; // ISO string
}

export interface LocalNutritionGoals {
  dailyCalories?: number | null;
  dailyProtein?: number | null;
  dailyCarbs?: number | null;
  dailyFat?: number | null;
  dailyFiber?: number | null;
  updatedAt: string; // ISO string
}

const MEALS_KEY = 'nutrition:meals';
const GOALS_KEY = 'nutrition:goals';

// Meal functions
export function getMeals(): LocalMeal[] {
  try {
    const stored = localStorage.getItem(MEALS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load meals from localStorage:', error);
    return [];
  }
}

export function addMeal(mealData: {
  mealType: string;
  name?: string;
  notes?: string;
  analysisData: NutritionAnalysis;
  imageUrl?: string;
}): LocalMeal {
  const meals = getMeals();
  const newMeal: LocalMeal = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...mealData,
    consumedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  meals.unshift(newMeal); // Add to beginning
  
  try {
    localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  } catch (error) {
    console.error('Failed to save meal to localStorage:', error);
    throw new Error('Failed to save meal');
  }
  
  return newMeal;
}

export function deleteMeal(mealId: string): boolean {
  try {
    const meals = getMeals();
    const filtered = meals.filter(meal => meal.id !== mealId);
    
    if (filtered.length === meals.length) {
      return false; // Meal not found
    }
    
    localStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete meal from localStorage:', error);
    return false;
  }
}

export function getMealsByDateRange(startDate: Date, endDate: Date): LocalMeal[] {
  const meals = getMeals();
  return meals.filter(meal => {
    const mealDate = new Date(meal.consumedAt);
    return mealDate >= startDate && mealDate <= endDate;
  });
}

// Nutrition goals functions
export function getGoals(): LocalNutritionGoals | null {
  try {
    const stored = localStorage.getItem(GOALS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load goals from localStorage:', error);
    return null;
  }
}

export function setGoals(goalsData: {
  dailyCalories?: number | null;
  dailyProtein?: number | null;
  dailyCarbs?: number | null;
  dailyFat?: number | null;
  dailyFiber?: number | null;
}): LocalNutritionGoals {
  const goals: LocalNutritionGoals = {
    ...goalsData,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Failed to save goals to localStorage:', error);
    throw new Error('Failed to save goals');
  }
  
  return goals;
}

// Utility function to clear all local data
export function clearAllData(): void {
  try {
    localStorage.removeItem(MEALS_KEY);
    localStorage.removeItem(GOALS_KEY);
  } catch (error) {
    console.error('Failed to clear local data:', error);
  }
}