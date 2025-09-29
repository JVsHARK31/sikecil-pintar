import type { Meal, NutritionGoals, NutritionAnalysis } from "@shared/schema";

// Recommended Daily Values (RDV) for adults
const RDV = {
  calories: { min: 1800, max: 2500 },
  protein: { min: 50, max: 200 }, // g
  carbs: { min: 130, max: 400 }, // g
  fat: { min: 44, max: 100 }, // g
  fiber: { min: 25, max: 38 }, // g
  sodium: { min: 0, max: 2300 }, // mg
  calcium: { min: 1000, max: 1300 }, // mg
  iron: { min: 8, max: 18 }, // mg
  vitamin_c: { min: 65, max: 90 }, // mg
  vitamin_a: { min: 700, max: 900 }, // mcg
};

export interface NutritionTrend {
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgFiber: number;
  avgSodium: number;
  avgCalcium: number;
  avgIron: number;
  avgVitaminC: number;
  avgVitaminA: number;
  mealFrequency: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  totalMeals: number;
  daysAnalyzed: number;
}

export interface Recommendation {
  id: string;
  type: 'deficiency' | 'excess' | 'balance' | 'habit';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestions: string[];
  nutrient?: string;
  currentValue?: number;
  targetValue?: number;
}

export function analyzeMealHistory(meals: Meal[], goals?: NutritionGoals): NutritionTrend {
  if (meals.length === 0) {
    return {
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      avgFiber: 0,
      avgSodium: 0,
      avgCalcium: 0,
      avgIron: 0,
      avgVitaminC: 0,
      avgVitaminA: 0,
      mealFrequency: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      totalMeals: 0,
      daysAnalyzed: 0,
    };
  }

  // Calculate unique days
  const uniqueDays = new Set(
    meals.map(meal => new Date(meal.consumedAt).toDateString())
  ).size;

  // Aggregate nutrition totals
  const totals = meals.reduce((acc, meal) => {
    const analysis = meal.analysisData as NutritionAnalysis;
    return {
      calories: acc.calories + analysis.totals.calories_kcal,
      protein: acc.protein + analysis.totals.macros.protein_g,
      carbs: acc.carbs + analysis.totals.macros.carbs_g,
      fat: acc.fat + analysis.totals.macros.fat_g,
      fiber: acc.fiber + analysis.totals.macros.fiber_g,
      sodium: acc.sodium + analysis.totals.micros.sodium_mg,
      calcium: acc.calcium + analysis.totals.micros.calcium_mg,
      iron: acc.iron + analysis.totals.micros.iron_mg,
      vitamin_c: acc.vitamin_c + analysis.totals.micros.vitamin_c_mg,
      vitamin_a: acc.vitamin_a + analysis.totals.micros.vitamin_a_mcg,
    };
  }, {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
    sodium: 0, calcium: 0, iron: 0, vitamin_c: 0, vitamin_a: 0
  });

  // Count meal types
  const mealFrequency = meals.reduce((acc, meal) => {
    const type = meal.mealType as keyof typeof acc;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, { breakfast: 0, lunch: 0, dinner: 0, snack: 0 });

  const daysAnalyzed = Math.max(uniqueDays, 1);

  return {
    avgCalories: totals.calories / daysAnalyzed,
    avgProtein: totals.protein / daysAnalyzed,
    avgCarbs: totals.carbs / daysAnalyzed,
    avgFat: totals.fat / daysAnalyzed,
    avgFiber: totals.fiber / daysAnalyzed,
    avgSodium: totals.sodium / daysAnalyzed,
    avgCalcium: totals.calcium / daysAnalyzed,
    avgIron: totals.iron / daysAnalyzed,
    avgVitaminC: totals.vitamin_c / daysAnalyzed,
    avgVitaminA: totals.vitamin_a / daysAnalyzed,
    mealFrequency,
    totalMeals: meals.length,
    daysAnalyzed,
  };
}

export function generateRecommendations(
  trend: NutritionTrend,
  goals?: NutritionGoals
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Use user goals if available, otherwise use RDV
  const targets = {
    calories: goals?.dailyCalories || RDV.calories.min,
    protein: goals?.dailyProtein || RDV.protein.min,
    carbs: goals?.dailyCarbs || RDV.carbs.min,
    fat: goals?.dailyFat || RDV.fat.min,
    fiber: goals?.dailyFiber || RDV.fiber.min,
  };

  // Calorie recommendations
  if (trend.avgCalories < targets.calories * 0.8) {
    recommendations.push({
      id: 'low-calories',
      type: 'deficiency',
      priority: 'high',
      title: 'Increase Daily Calories',
      description: `Your average daily intake (${Math.round(trend.avgCalories)} kcal) is below your target (${targets.calories} kcal).`,
      suggestions: [
        'Add healthy snacks between meals',
        'Include nuts, seeds, or avocado for calorie-dense nutrition',
        'Consider larger portion sizes',
        'Add olive oil or nut butters to meals'
      ],
      nutrient: 'calories',
      currentValue: Math.round(trend.avgCalories),
      targetValue: targets.calories
    });
  } else if (trend.avgCalories > targets.calories * 1.2) {
    recommendations.push({
      id: 'high-calories',
      type: 'excess',
      priority: 'medium',
      title: 'Monitor Calorie Intake',
      description: `Your average daily intake (${Math.round(trend.avgCalories)} kcal) exceeds your target (${targets.calories} kcal).`,
      suggestions: [
        'Focus on portion control',
        'Choose lower-calorie alternatives',
        'Increase vegetable portions',
        'Limit high-calorie beverages'
      ],
      nutrient: 'calories',
      currentValue: Math.round(trend.avgCalories),
      targetValue: targets.calories
    });
  }

  // Protein recommendations
  if (trend.avgProtein < targets.protein * 0.8) {
    recommendations.push({
      id: 'low-protein',
      type: 'deficiency',
      priority: 'high',
      title: 'Increase Protein Intake',
      description: `Your average protein intake (${Math.round(trend.avgProtein)}g) is below your target (${targets.protein}g).`,
      suggestions: [
        'Add lean meats, fish, or poultry to meals',
        'Include beans, lentils, or tofu for plant-based protein',
        'Add Greek yogurt or cottage cheese as snacks',
        'Consider protein-rich eggs for breakfast'
      ],
      nutrient: 'protein',
      currentValue: Math.round(trend.avgProtein),
      targetValue: targets.protein
    });
  }

  // Fiber recommendations
  if (trend.avgFiber < targets.fiber * 0.7) {
    recommendations.push({
      id: 'low-fiber',
      type: 'deficiency',
      priority: 'medium',
      title: 'Increase Fiber Intake',
      description: `Your average fiber intake (${Math.round(trend.avgFiber)}g) is below recommended levels (${targets.fiber}g).`,
      suggestions: [
        'Add more fruits and vegetables to meals',
        'Choose whole grain breads and cereals',
        'Include beans and legumes regularly',
        'Snack on high-fiber fruits like pears and apples'
      ],
      nutrient: 'fiber',
      currentValue: Math.round(trend.avgFiber),
      targetValue: targets.fiber
    });
  }

  // Sodium recommendations
  if (trend.avgSodium > RDV.sodium.max) {
    recommendations.push({
      id: 'high-sodium',
      type: 'excess',
      priority: 'medium',
      title: 'Reduce Sodium Intake',
      description: `Your average sodium intake (${Math.round(trend.avgSodium)}mg) exceeds recommended limits (${RDV.sodium.max}mg).`,
      suggestions: [
        'Choose fresh foods over processed ones',
        'Cook more meals at home',
        'Use herbs and spices instead of salt',
        'Read nutrition labels carefully'
      ],
      nutrient: 'sodium',
      currentValue: Math.round(trend.avgSodium),
      targetValue: RDV.sodium.max
    });
  }

  // Calcium recommendations
  if (trend.avgCalcium < RDV.calcium.min) {
    recommendations.push({
      id: 'low-calcium',
      type: 'deficiency',
      priority: 'medium',
      title: 'Increase Calcium Intake',
      description: `Your average calcium intake (${Math.round(trend.avgCalcium)}mg) is below recommended levels (${RDV.calcium.min}mg).`,
      suggestions: [
        'Include dairy products like milk, yogurt, and cheese',
        'Add leafy greens like kale and spinach',
        'Try calcium-fortified plant milks',
        'Include sardines or canned salmon with bones'
      ],
      nutrient: 'calcium',
      currentValue: Math.round(trend.avgCalcium),
      targetValue: RDV.calcium.min
    });
  }

  // Iron recommendations
  if (trend.avgIron < RDV.iron.min) {
    recommendations.push({
      id: 'low-iron',
      type: 'deficiency',
      priority: 'medium',
      title: 'Increase Iron Intake',
      description: `Your average iron intake (${Math.round(trend.avgIron)}mg) is below recommended levels (${RDV.iron.min}mg).`,
      suggestions: [
        'Include lean red meat, poultry, and fish',
        'Add iron-rich vegetables like spinach and broccoli',
        'Combine iron-rich foods with vitamin C sources',
        'Consider iron-fortified cereals'
      ],
      nutrient: 'iron',
      currentValue: Math.round(trend.avgIron),
      targetValue: RDV.iron.min
    });
  }

  // Vitamin C recommendations
  if (trend.avgVitaminC < RDV.vitamin_c.min) {
    recommendations.push({
      id: 'low-vitamin-c',
      type: 'deficiency',
      priority: 'low',
      title: 'Increase Vitamin C Intake',
      description: `Your average vitamin C intake (${Math.round(trend.avgVitaminC)}mg) is below recommended levels (${RDV.vitamin_c.min}mg).`,
      suggestions: [
        'Add citrus fruits like oranges and grapefruits',
        'Include berries in your diet',
        'Add bell peppers and broccoli to meals',
        'Try kiwi fruit or strawberries as snacks'
      ],
      nutrient: 'vitamin_c',
      currentValue: Math.round(trend.avgVitaminC),
      targetValue: RDV.vitamin_c.min
    });
  }

  // Meal pattern recommendations
  if (trend.mealFrequency.breakfast < trend.daysAnalyzed * 0.5) {
    recommendations.push({
      id: 'skipping-breakfast',
      type: 'habit',
      priority: 'medium',
      title: 'Eat Breakfast More Regularly',
      description: 'You\'re skipping breakfast frequently. Regular breakfast can help maintain energy levels throughout the day.',
      suggestions: [
        'Prepare overnight oats or yogurt parfaits',
        'Keep simple options like bananas and nuts handy',
        'Try protein-rich options like eggs or Greek yogurt',
        'Set a morning eating routine'
      ]
    });
  }

  // Balance recommendations
  const proteinPercent = (trend.avgProtein * 4) / trend.avgCalories * 100;
  const carbPercent = (trend.avgCarbs * 4) / trend.avgCalories * 100;
  const fatPercent = (trend.avgFat * 9) / trend.avgCalories * 100;

  if (carbPercent > 65) {
    recommendations.push({
      id: 'high-carb-ratio',
      type: 'balance',
      priority: 'low',
      title: 'Balance Macronutrients',
      description: `Your diet is very high in carbohydrates (${Math.round(carbPercent)}%). Consider balancing with more protein and healthy fats.`,
      suggestions: [
        'Replace some refined carbs with protein sources',
        'Add healthy fats like nuts, seeds, or olive oil',
        'Choose complex carbohydrates over simple ones',
        'Include protein with each meal'
      ]
    });
  }

  // Sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
}