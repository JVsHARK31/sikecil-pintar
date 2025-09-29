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
