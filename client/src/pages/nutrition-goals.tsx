import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, Activity, TrendingUp, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getGoals, setGoals, type LocalNutritionGoals } from "@/lib/localStore";

const nutritionGoalsFormSchema = z.object({
  dailyCalories: z.coerce.number().min(800).max(5000).optional(),
  dailyProtein: z.coerce.number().min(10).max(300).optional(),
  dailyCarbs: z.coerce.number().min(50).max(800).optional(),
  dailyFat: z.coerce.number().min(20).max(200).optional(),
  dailyFiber: z.coerce.number().min(10).max(100).optional(),
});

type NutritionGoalsFormData = z.infer<typeof nutritionGoalsFormSchema>;

interface NutritionGoalsPageProps {
  onBack: () => void;
}

export function NutritionGoalsPage({ onBack }: NutritionGoalsPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NutritionGoalsFormData>({
    resolver: zodResolver(nutritionGoalsFormSchema),
    defaultValues: {
      dailyCalories: undefined,
      dailyProtein: undefined,
      dailyCarbs: undefined,
      dailyFat: undefined,
      dailyFiber: undefined,
    },
  });

  // Fetch existing nutrition goals
  const { data: nutritionGoals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      return getGoals();
    },
  });

  // Populate form with existing goals
  useEffect(() => {
    if (nutritionGoals) {
      form.reset({
        dailyCalories: nutritionGoals.dailyCalories || undefined,
        dailyProtein: nutritionGoals.dailyProtein || undefined,
        dailyCarbs: nutritionGoals.dailyCarbs || undefined,
        dailyFat: nutritionGoals.dailyFat || undefined,
        dailyFiber: nutritionGoals.dailyFiber || undefined,
      });
    }
  }, [nutritionGoals, form]);

  // Create or update nutrition goals
  const saveMutation = useMutation({
    mutationFn: async (data: NutritionGoalsFormData) => {
      const goalsData = {
        dailyCalories: data.dailyCalories || null,
        dailyProtein: data.dailyProtein || null,
        dailyCarbs: data.dailyCarbs || null,
        dailyFat: data.dailyFat || null,
        dailyFiber: data.dailyFiber || null,
      };

      return setGoals(goalsData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Goals saved!",
        description: "Your nutrition goals have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message || "Failed to save nutrition goals",
      });
    },
  });

  const onSubmit = (data: NutritionGoalsFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading nutrition goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center space-x-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Nutrition Goals</h1>
                <p className="text-sm text-muted-foreground">Set your daily nutrition targets</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Goals Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Daily Nutrition Targets</span>
                </CardTitle>
                <CardDescription>
                  Set your personalized daily nutrition goals. Leave fields empty if you don't want to track that nutrient.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <FormField
                        control={form.control}
                        name="dailyCalories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Calories</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="2000"
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-daily-calories"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">kcal</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Recommended: 1800-2500 kcal for adults
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dailyProtein"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Protein</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="150"
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-daily-protein"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">g</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Recommended: 0.8-1.2g per kg body weight
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dailyCarbs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Carbohydrates</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="250"
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-daily-carbs"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">g</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Recommended: 45-65% of total calories
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dailyFat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Fat</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="67"
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-daily-fat"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">g</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Recommended: 20-35% of total calories
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dailyFiber"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Daily Fiber</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="25"
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-daily-fiber"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">g</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Recommended: 25g for women, 38g for men
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="flex items-center space-x-2"
                        data-testid="button-save-goals"
                      >
                        <Save className="h-4 w-4" />
                        <span>{saveMutation.isPending ? "Saving..." : "Save Goals"}</span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Goals Summary & Tips */}
          <div className="space-y-6">
            
            {/* Current Goals Summary */}
            {nutritionGoals && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-secondary" />
                    <span>Current Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nutritionGoals.dailyCalories && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Calories</span>
                      <span className="font-medium" data-testid="text-current-calories">
                        {nutritionGoals.dailyCalories} kcal
                      </span>
                    </div>
                  )}
                  {nutritionGoals.dailyProtein && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Protein</span>
                      <span className="font-medium" data-testid="text-current-protein">
                        {nutritionGoals.dailyProtein}g
                      </span>
                    </div>
                  )}
                  {nutritionGoals.dailyCarbs && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Carbs</span>
                      <span className="font-medium" data-testid="text-current-carbs">
                        {nutritionGoals.dailyCarbs}g
                      </span>
                    </div>
                  )}
                  {nutritionGoals.dailyFat && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fat</span>
                      <span className="font-medium" data-testid="text-current-fat">
                        {nutritionGoals.dailyFat}g
                      </span>
                    </div>
                  )}
                  {nutritionGoals.dailyFiber && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fiber</span>
                      <span className="font-medium" data-testid="text-current-fiber">
                        {nutritionGoals.dailyFiber}g
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Start with calorie goals and gradually add macronutrient targets</p>
                <p>• Adjust goals based on your activity level and health objectives</p>
                <p>• Track your meals regularly to see how you're progressing</p>
                <p>• Consider consulting with a nutritionist for personalized advice</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}