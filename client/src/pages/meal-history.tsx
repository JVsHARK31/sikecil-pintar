import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Download, ChevronLeft, Filter } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Meal, NutritionAnalysis } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface MealHistoryProps {
  onBack: () => void;
}

export function MealHistory({ onBack }: MealHistoryProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['/api/meals', user?.id, selectedPeriod],
    queryFn: async () => {
      if (!user) return [];
      
      let url = `/api/meals/${user.id}`;
      if (selectedPeriod !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (selectedPeriod === 'week' ? 7 : 30));
        url += `/range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch meals');
      return response.json() as Promise<Meal[]>;
    },
    enabled: !!user,
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: number) => {
      if (!user) throw new Error('User not authenticated');
      const response = await apiRequest('DELETE', `/api/meals/${mealId}/${user.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
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

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Please log in to view your meal history.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} data-testid="button-back">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
          <h1 className="text-2xl font-bold">Meal History</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex rounded-md overflow-hidden border">
            {(['week', 'month', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="rounded-none border-r last:border-r-0"
                data-testid={`button-filter-${period}`}
              >
                {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary" data-testid="text-total-meals">
              {meals.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Meals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary" data-testid="text-total-calories">
              {Math.round(totals.calories)}
            </div>
            <div className="text-sm text-muted-foreground">Total Calories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600" data-testid="text-avg-calories">
              {meals.length > 0 ? Math.round(totals.calories / meals.length) : 0}
            </div>
            <div className="text-sm text-muted-foreground">Avg per Meal</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-protein">
              {Math.round(totals.protein)}g
            </div>
            <div className="text-sm text-muted-foreground">Total Protein</div>
          </CardContent>
        </Card>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Loading your meals...</p>
          </div>
        ) : meals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No meals recorded</h3>
              <p className="text-sm text-muted-foreground">
                Start analyzing your meals to build your nutrition history.
              </p>
            </CardContent>
          </Card>
        ) : (
          meals.map((meal) => {
            const analysis = meal.analysisData as NutritionAnalysis;
            return (
              <Card key={meal.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge className={getMealTypeColor(meal.mealType)}>
                          {meal.mealType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(meal.consumedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      
                      {meal.name && (
                        <h3 className="font-medium mb-2" data-testid={`text-meal-name-${meal.id}`}>
                          {meal.name}
                        </h3>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-1">Items detected:</p>
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
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{meal.notes}"
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMealMutation.mutate(meal.id)}
                      disabled={deleteMealMutation.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
  );
}