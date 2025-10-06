import type { NutritionAnalysis } from "@shared/schema";

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
