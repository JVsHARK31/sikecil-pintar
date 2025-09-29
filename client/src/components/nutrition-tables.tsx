import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import type { NutritionAnalysis } from "@shared/schema";
import { getConfidenceClass } from "@/lib/image";

interface NutritionTablesProps {
  analysis: NutritionAnalysis;
}

export function NutritionTables({ analysis }: NutritionTablesProps) {
  const { composition, totals } = analysis;

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { label: "High", variant: "default" as const };
    if (confidence >= 0.6) return { label: "Medium", variant: "secondary" as const };
    return { label: "Low", variant: "destructive" as const };
  };

  const calculateMacroPercentage = (macro: number, totalCalories: number) => {
    if (totalCalories === 0) return 0;
    const caloriesFromMacro = macro * (macro === totals.macros.protein_g || macro === totals.macros.carbs_g ? 4 : 9);
    return (caloriesFromMacro / totalCalories) * 100;
  };

  return (
    <div className="space-y-4">
      {/* Total Nutrition Card */}
      <Card className="nutrition-card">
        <CardHeader>
          <CardTitle>Total Nutrition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calories and Weight Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-total-calories">
                {totals.calories_kcal}
              </div>
              <div className="text-sm text-muted-foreground">Total Calories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary" data-testid="text-total-weight">
                {totals.serving_total_g}
              </div>
              <div className="text-sm text-muted-foreground">Total Weight (g)</div>
            </div>
          </div>
          
          {/* Macronutrients with Progress Bars */}
          <div className="space-y-3">
            <h4 className="font-semibold">Macronutrients</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Protein</span>
                <div className="flex items-center space-x-3">
                  <Progress 
                    value={calculateMacroPercentage(totals.macros.protein_g, totals.calories_kcal)} 
                    className="w-20 h-2" 
                  />
                  <span className="text-sm font-medium w-12 text-right" data-testid="text-total-protein">
                    {totals.macros.protein_g}g
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Carbs</span>
                <div className="flex items-center space-x-3">
                  <Progress 
                    value={calculateMacroPercentage(totals.macros.carbs_g, totals.calories_kcal)} 
                    className="w-20 h-2" 
                  />
                  <span className="text-sm font-medium w-12 text-right" data-testid="text-total-carbs">
                    {totals.macros.carbs_g}g
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fat</span>
                <div className="flex items-center space-x-3">
                  <Progress 
                    value={calculateMacroPercentage(totals.macros.fat_g, totals.calories_kcal)} 
                    className="w-20 h-2" 
                  />
                  <span className="text-sm font-medium w-12 text-right" data-testid="text-total-fat">
                    {totals.macros.fat_g}g
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Items */}
      <div className="space-y-3">
        <h3 className="font-semibold">Individual Items</h3>
        
        {composition.length === 0 ? (
          <Card className="border-dashed border-muted-foreground/30">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-muted-foreground space-y-2">
                <div className="text-lg">🍽️</div>
                <div className="font-medium">No food items detected</div>
                <div className="text-sm">
                  Try uploading a clearer image with visible food items, or ensure the image contains recognizable foods.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          composition.map((item, index) => {
          const confidenceBadge = getConfidenceBadge(item.confidence);
          
          return (
            <Card key={index} className={`border ${getConfidenceClass(item.confidence)}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: `hsl(${120 + index * 40}, 50%, 50%)` }}
                    />
                    <span className="font-medium" data-testid={`text-item-label-${index}`}>
                      {item.label}
                    </span>
                    <Badge variant={confidenceBadge.variant} className="text-xs">
                      {confidenceBadge.label} ({(item.confidence * 100).toFixed(0)}%)
                    </Badge>
                    {item.confidence < 0.4 && (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" data-testid={`text-item-calories-${index}`}>
                      {item.nutrition.calories_kcal} kcal
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid={`text-item-weight-${index}`}>
                      {item.serving_est_g}g
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium" data-testid={`text-item-protein-${index}`}>
                      {item.nutrition.macros.protein_g}g
                    </div>
                    <div className="text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium" data-testid={`text-item-carbs-${index}`}>
                      {item.nutrition.macros.carbs_g}g
                    </div>
                    <div className="text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium" data-testid={`text-item-fat-${index}`}>
                      {item.nutrition.macros.fat_g}g
                    </div>
                    <div className="text-muted-foreground">Fat</div>
                  </div>
                </div>

                {/* Allergens for this item */}
                {item.nutrition.allergens.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-wrap gap-1">
                      {item.nutrition.allergens.map((allergen, allergenIndex) => (
                        <Badge 
                          key={allergenIndex} 
                          variant="outline" 
                          className="text-xs bg-red-50 text-red-700 border-red-200"
                        >
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }))}
      </div>

      {/* Allergens Warning */}
      {totals.allergens.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-900">Allergen Information</h4>
            </div>
            <div className="flex flex-wrap gap-2" data-testid="allergens-list">
              {totals.allergens.map((allergen, index) => (
                <Badge 
                  key={index} 
                  className="bg-red-100 text-red-800 border-red-300"
                >
                  {allergen}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Micronutrients */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Micronutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold" data-testid="text-sodium">
                {totals.micros.sodium_mg}
              </div>
              <div className="text-sm text-muted-foreground">Sodium (mg)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold" data-testid="text-potassium">
                {totals.micros.potassium_mg}
              </div>
              <div className="text-sm text-muted-foreground">Potassium (mg)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold" data-testid="text-calcium">
                {totals.micros.calcium_mg}
              </div>
              <div className="text-sm text-muted-foreground">Calcium (mg)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold" data-testid="text-iron">
                {totals.micros.iron_mg}
              </div>
              <div className="text-sm text-muted-foreground">Iron (mg)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold" data-testid="text-vitamin-a">
                {totals.micros.vitamin_a_mcg}
              </div>
              <div className="text-sm text-muted-foreground">Vitamin A (mcg)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold" data-testid="text-vitamin-c">
                {totals.micros.vitamin_c_mg}
              </div>
              <div className="text-sm text-muted-foreground">Vitamin C (mg)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold" data-testid="text-cholesterol">
                {totals.micros.cholesterol_mg}
              </div>
              <div className="text-sm text-muted-foreground">Cholesterol (mg)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold" data-testid="text-fiber">
                {totals.macros.fiber_g}
              </div>
              <div className="text-sm text-muted-foreground">Fiber (g)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Notes */}
      {analysis.notes && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h4 className="font-medium text-blue-900 mb-2">Analysis Notes</h4>
            <p className="text-blue-800 text-sm">{analysis.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
