import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Download, ChevronLeft, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { NutritionAnalysis } from "@shared/schema";
import { getMeals, getMealsByDateRange, deleteMeal, type LocalMeal } from "@/lib/localStore";

interface MealHistoryProps {
  onBack: () => void;
}

export function MealHistory({ onBack }: MealHistoryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['meals', selectedPeriod],
    queryFn: async () => {
      if (selectedPeriod === 'all') {
        return getMeals();
      } else {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (selectedPeriod === 'week' ? 7 : 30));
        return getMealsByDateRange(startDate, endDate);
      }
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const success = deleteMeal(mealId);
      if (!success) {
        throw new Error('Meal not found');
      }
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast({
        title: "Meal deleted",
        description: "The meal has been removed from your history.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete meal",
      });
    },
  });

  const getTotalNutrition = () => {
    return meals.reduce((totals, meal) => {
      const analysis = meal.analysisData as NutritionAnalysis;
      return {
        calories: totals.calories + analysis.totals.calories_kcal,
        protein: totals.protein + analysis.totals.macros.protein_g,
        carbs: totals.carbs + analysis.totals.macros.carbs_g,
        fat: totals.fat + analysis.totals.macros.fat_g,
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lunch': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dinner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'snack': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totals = getTotalNutrition();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back" className="px-2 sm:px-4">
                <ChevronLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Analysis</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold">Meal History</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <div className="flex rounded-md overflow-hidden border w-full sm:w-auto">
                {(['week', 'month', 'all'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className="rounded-none border-r last:border-r-0 flex-1 sm:flex-none text-xs sm:text-sm"
                    data-testid={`button-filter-${period}`}
                  >
                    {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary" data-testid="text-total-meals">
                {meals.length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Meals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-secondary" data-testid="text-total-calories">
                {Math.round(totals.calories)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Calories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600" data-testid="text-avg-calories">
                {meals.length > 0 ? Math.round(totals.calories / meals.length) : 0}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg per Meal</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600" data-testid="text-total-protein">
                {Math.round(totals.protein)}g
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Protein</div>
            </CardContent>
          </Card>
        </div>

        {/* Meals List */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="text-center p-6 sm:p-8">
              <p className="text-sm sm:text-base text-muted-foreground">Loading your meals...</p>
            </div>
          ) : meals.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-medium mb-2">No meals recorded</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Start analyzing your meals to build your nutrition history.
                </p>
              </CardContent>
            </Card>
          ) : (
            meals.map((meal) => {
              const analysis = meal.analysisData as NutritionAnalysis;
              return (
                <Card key={meal.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <Badge className={getMealTypeColor(meal.mealType)}>
                            {meal.mealType}
                          </Badge>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {format(new Date(meal.consumedAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        
                        {meal.name && (
                          <h3 className="text-sm sm:text-base font-medium mb-2" data-testid={`text-meal-name-${meal.id}`}>
                            {meal.name}
                          </h3>
                        )}
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm mb-3">
                          <div>
                            <span className="font-medium">{analysis.totals.calories_kcal}</span>
                            <span className="text-muted-foreground ml-1">kcal</span>
                          </div>
                          <div>
                            <span className="font-medium">{analysis.totals.macros.protein_g}g</span>
                            <span className="text-muted-foreground ml-1">protein</span>
                          </div>
                          <div>
                            <span className="font-medium">{analysis.totals.macros.carbs_g}g</span>
                            <span className="text-muted-foreground ml-1">carbs</span>
                          </div>
                          <div>
                            <span className="font-medium">{analysis.totals.macros.fat_g}g</span>
                            <span className="text-muted-foreground ml-1">fat</span>
                          </div>
                        </div>
                        
                        {analysis.composition.length > 0 && (
                          <div className="mt-2 sm:mt-3">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Items detected:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.composition.map((item, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {item.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {meal.notes && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2 italic">
                            "{meal.notes}"
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMealMutation.mutate(meal.id)}
                        disabled={deleteMealMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 self-end sm:self-start"
                        data-testid={`button-delete-meal-${meal.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}