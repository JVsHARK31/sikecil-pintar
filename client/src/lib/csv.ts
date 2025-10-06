import type { NutritionAnalysis } from "@shared/schema";
import type { LocalMeal } from "./localStore";
import { format } from "date-fns";

export function exportToCSV(analysis: NutritionAnalysis): string {
  const headers = [
    'Item',
    'Confidence',
    'Weight (g)',
    'Calories (kcal)',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Fiber (g)',
    'Sugar (g)',
    'Sodium (mg)',
    'Potassium (mg)',
    'Calcium (mg)',
    'Iron (mg)',
    'Vitamin A (mcg)',
    'Vitamin C (mg)',
    'Cholesterol (mg)',
    'Allergens'
  ];

  const rows = analysis.composition.map(item => [
    item.label,
    (item.confidence * 100).toFixed(1) + '%',
    item.serving_est_g.toString(),
    item.nutrition.calories_kcal.toString(),
    item.nutrition.macros.protein_g.toString(),
    item.nutrition.macros.carbs_g.toString(),
    item.nutrition.macros.fat_g.toString(),
    item.nutrition.macros.fiber_g.toString(),
    item.nutrition.macros.sugar_g.toString(),
    item.nutrition.micros.sodium_mg.toString(),
    item.nutrition.micros.potassium_mg.toString(),
    item.nutrition.micros.calcium_mg.toString(),
    item.nutrition.micros.iron_mg.toString(),
    item.nutrition.micros.vitamin_a_mcg.toString(),
    item.nutrition.micros.vitamin_c_mg.toString(),
    item.nutrition.micros.cholesterol_mg.toString(),
    item.nutrition.allergens.join('; ')
  ]);

  // Add totals row
  const totalsRow = [
    'TOTAL',
    '100%',
    analysis.totals.serving_total_g.toString(),
    analysis.totals.calories_kcal.toString(),
    analysis.totals.macros.protein_g.toString(),
    analysis.totals.macros.carbs_g.toString(),
    analysis.totals.macros.fat_g.toString(),
    analysis.totals.macros.fiber_g.toString(),
    analysis.totals.macros.sugar_g.toString(),
    analysis.totals.micros.sodium_mg.toString(),
    analysis.totals.micros.potassium_mg.toString(),
    analysis.totals.micros.calcium_mg.toString(),
    analysis.totals.micros.iron_mg.toString(),
    analysis.totals.micros.vitamin_a_mcg.toString(),
    analysis.totals.micros.vitamin_c_mg.toString(),
    analysis.totals.micros.cholesterol_mg.toString(),
    analysis.totals.allergens.join('; ')
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    totalsRow.map(cell => `"${cell}"`).join(',')
  ].join('\n');

  return csvContent;
}

export function downloadCSV(analysis: NutritionAnalysis, filename: string = 'nutrition-analysis.csv') {
  const csvContent = exportToCSV(analysis);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function downloadJSON(analysis: NutritionAnalysis, filename: string = 'nutrition-analysis.json') {
  const jsonContent = JSON.stringify(analysis, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportToTXT(analysis: NutritionAnalysis): string {
  let txtContent = '===================================\n';
  txtContent += '    NUTRITION ANALYSIS REPORT\n';
  txtContent += '===================================\n\n';
  
  txtContent += 'OVERALL TOTALS\n';
  txtContent += '-----------------------------------\n';
  txtContent += `Total Weight: ${analysis.totals.serving_total_g}g\n`;
  txtContent += `Total Calories: ${analysis.totals.calories_kcal} kcal\n\n`;
  
  txtContent += 'MACRONUTRIENTS\n';
  txtContent += '-----------------------------------\n';
  txtContent += `Protein: ${analysis.totals.macros.protein_g}g\n`;
  txtContent += `Carbohydrates: ${analysis.totals.macros.carbs_g}g\n`;
  txtContent += `  - Fiber: ${analysis.totals.macros.fiber_g}g\n`;
  txtContent += `  - Sugar: ${analysis.totals.macros.sugar_g}g\n`;
  txtContent += `Fat: ${analysis.totals.macros.fat_g}g\n\n`;
  
  txtContent += 'MICRONUTRIENTS\n';
  txtContent += '-----------------------------------\n';
  txtContent += `Sodium: ${analysis.totals.micros.sodium_mg}mg\n`;
  txtContent += `Potassium: ${analysis.totals.micros.potassium_mg}mg\n`;
  txtContent += `Calcium: ${analysis.totals.micros.calcium_mg}mg\n`;
  txtContent += `Iron: ${analysis.totals.micros.iron_mg}mg\n`;
  txtContent += `Vitamin A: ${analysis.totals.micros.vitamin_a_mcg}mcg\n`;
  txtContent += `Vitamin C: ${analysis.totals.micros.vitamin_c_mg}mg\n`;
  txtContent += `Cholesterol: ${analysis.totals.micros.cholesterol_mg}mg\n\n`;
  
  if (analysis.totals.allergens.length > 0) {
    txtContent += 'ALLERGENS\n';
    txtContent += '-----------------------------------\n';
    txtContent += analysis.totals.allergens.join(', ') + '\n\n';
  }
  
  txtContent += 'DETECTED FOOD ITEMS\n';
  txtContent += '===================================\n\n';
  
  analysis.composition.forEach((item, index) => {
    txtContent += `${index + 1}. ${item.label.toUpperCase()}\n`;
    txtContent += `   Confidence: ${(item.confidence * 100).toFixed(1)}%\n`;
    txtContent += `   Weight: ${item.serving_est_g}g\n`;
    txtContent += `   Calories: ${item.nutrition.calories_kcal} kcal\n`;
    txtContent += `   \n`;
    txtContent += `   Macros:\n`;
    txtContent += `     - Protein: ${item.nutrition.macros.protein_g}g\n`;
    txtContent += `     - Carbs: ${item.nutrition.macros.carbs_g}g\n`;
    txtContent += `     - Fat: ${item.nutrition.macros.fat_g}g\n`;
    txtContent += `     - Fiber: ${item.nutrition.macros.fiber_g}g\n`;
    txtContent += `     - Sugar: ${item.nutrition.macros.sugar_g}g\n`;
    txtContent += `   \n`;
    txtContent += `   Micros:\n`;
    txtContent += `     - Sodium: ${item.nutrition.micros.sodium_mg}mg\n`;
    txtContent += `     - Potassium: ${item.nutrition.micros.potassium_mg}mg\n`;
    txtContent += `     - Calcium: ${item.nutrition.micros.calcium_mg}mg\n`;
    txtContent += `     - Iron: ${item.nutrition.micros.iron_mg}mg\n`;
    txtContent += `     - Vitamin A: ${item.nutrition.micros.vitamin_a_mcg}mcg\n`;
    txtContent += `     - Vitamin C: ${item.nutrition.micros.vitamin_c_mg}mg\n`;
    txtContent += `     - Cholesterol: ${item.nutrition.micros.cholesterol_mg}mg\n`;
    
    if (item.nutrition.allergens.length > 0) {
      txtContent += `   \n`;
      txtContent += `   Allergens: ${item.nutrition.allergens.join(', ')}\n`;
    }
    txtContent += `\n`;
  });
  
  txtContent += '===================================\n';
  txtContent += `Generated: ${new Date().toLocaleString()}\n`;
  txtContent += '===================================\n';
  
  return txtContent;
}

export function downloadTXT(analysis: NutritionAnalysis, filename: string = 'nutrition-analysis.txt') {
  const txtContent = exportToTXT(analysis);
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Meal History Export Functions
export function exportMealsToJSON(meals: LocalMeal[]): string {
  return JSON.stringify(meals, null, 2);
}

export function downloadMealsJSON(meals: LocalMeal[], filename: string = 'meal-history.json') {
  const jsonContent = exportMealsToJSON(meals);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportMealsToCSV(meals: LocalMeal[]): string {
  const headers = [
    'Date',
    'Time',
    'Meal Type',
    'Name',
    'Notes',
    'Calories (kcal)',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Fiber (g)',
    'Sugar (g)',
    'Sodium (mg)',
    'Items Count',
    'Items'
  ];

  const rows = meals.map(meal => {
    const consumedAt = new Date(meal.consumedAt);
    const analysis = meal.analysisData as NutritionAnalysis;
    const itemLabels = analysis.composition.map(item => item.label).join('; ');

    return [
      format(consumedAt, 'yyyy-MM-dd'),
      format(consumedAt, 'HH:mm:ss'),
      meal.mealType,
      meal.name || '',
      meal.notes || '',
      analysis.totals.calories_kcal.toString(),
      analysis.totals.macros.protein_g.toString(),
      analysis.totals.macros.carbs_g.toString(),
      analysis.totals.macros.fat_g.toString(),
      analysis.totals.macros.fiber_g.toString(),
      analysis.totals.macros.sugar_g.toString(),
      analysis.totals.micros.sodium_mg.toString(),
      analysis.composition.length.toString(),
      itemLabels
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function downloadMealsCSV(meals: LocalMeal[], filename: string = 'meal-history.csv') {
  const csvContent = exportMealsToCSV(meals);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportMealsToTXT(meals: LocalMeal[]): string {
  let txtContent = '============================================\n';
  txtContent += '         MEAL HISTORY REPORT\n';
  txtContent += '============================================\n\n';
  
  txtContent += `Total Meals: ${meals.length}\n`;
  txtContent += `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
  
  // Calculate totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  meals.forEach(meal => {
    const analysis = meal.analysisData as NutritionAnalysis;
    totalCalories += analysis.totals.calories_kcal;
    totalProtein += analysis.totals.macros.protein_g;
    totalCarbs += analysis.totals.macros.carbs_g;
    totalFat += analysis.totals.macros.fat_g;
  });
  
  txtContent += 'OVERALL SUMMARY\n';
  txtContent += '--------------------------------------------\n';
  txtContent += `Total Calories: ${totalCalories.toFixed(1)} kcal\n`;
  txtContent += `Total Protein: ${totalProtein.toFixed(1)}g\n`;
  txtContent += `Total Carbs: ${totalCarbs.toFixed(1)}g\n`;
  txtContent += `Total Fat: ${totalFat.toFixed(1)}g\n`;
  txtContent += `Average Calories per Meal: ${meals.length > 0 ? (totalCalories / meals.length).toFixed(1) : 0} kcal\n\n`;
  
  txtContent += 'DETAILED MEAL HISTORY\n';
  txtContent += '============================================\n\n';
  
  meals.forEach((meal, index) => {
    const consumedAt = new Date(meal.consumedAt);
    const analysis = meal.analysisData as NutritionAnalysis;
    
    txtContent += `${index + 1}. ${meal.mealType.toUpperCase()}\n`;
    txtContent += `   Date: ${format(consumedAt, 'yyyy-MM-dd HH:mm:ss')}\n`;
    
    if (meal.name) {
      txtContent += `   Name: ${meal.name}\n`;
    }
    
    if (meal.notes) {
      txtContent += `   Notes: ${meal.notes}\n`;
    }
    
    txtContent += `\n`;
    txtContent += `   Nutrition Summary:\n`;
    txtContent += `   - Calories: ${analysis.totals.calories_kcal} kcal\n`;
    txtContent += `   - Protein: ${analysis.totals.macros.protein_g}g\n`;
    txtContent += `   - Carbs: ${analysis.totals.macros.carbs_g}g\n`;
    txtContent += `   - Fat: ${analysis.totals.macros.fat_g}g\n`;
    txtContent += `   - Fiber: ${analysis.totals.macros.fiber_g}g\n`;
    txtContent += `   - Sugar: ${analysis.totals.macros.sugar_g}g\n`;
    
    if (analysis.composition.length > 0) {
      txtContent += `\n`;
      txtContent += `   Detected Items (${analysis.composition.length}):\n`;
      analysis.composition.forEach((item, itemIndex) => {
        txtContent += `   ${itemIndex + 1}. ${item.label} (${item.serving_est_g}g, ${item.nutrition.calories_kcal} kcal)\n`;
      });
    }
    
    txtContent += `\n   Micronutrients:\n`;
    txtContent += `   - Sodium: ${analysis.totals.micros.sodium_mg}mg\n`;
    txtContent += `   - Potassium: ${analysis.totals.micros.potassium_mg}mg\n`;
    txtContent += `   - Calcium: ${analysis.totals.micros.calcium_mg}mg\n`;
    txtContent += `   - Iron: ${analysis.totals.micros.iron_mg}mg\n`;
    txtContent += `   - Vitamin A: ${analysis.totals.micros.vitamin_a_mcg}mcg\n`;
    txtContent += `   - Vitamin C: ${analysis.totals.micros.vitamin_c_mg}mg\n`;
    
    if (analysis.totals.allergens.length > 0) {
      txtContent += `\n`;
      txtContent += `   Allergens: ${analysis.totals.allergens.join(', ')}\n`;
    }
    
    txtContent += `\n--------------------------------------------\n\n`;
  });
  
  txtContent += '============================================\n';
  txtContent += 'END OF REPORT\n';
  txtContent += '============================================\n';
  
  return txtContent;
}

export function downloadMealsTXT(meals: LocalMeal[], filename: string = 'meal-history.txt') {
  const txtContent = exportMealsToTXT(meals);
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
