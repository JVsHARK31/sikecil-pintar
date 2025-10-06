import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, History, Save, Target, HelpCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraPanel } from "@/components/camera-panel";
import { UploadPanel } from "@/components/upload-panel";
import { OverlayCanvas } from "@/components/overlay-canvas";
import { NutritionTables } from "@/components/nutrition-tables";
import { Downloads } from "@/components/downloads";
import { EducationalDisclaimer, LoadingOverlay } from "@/components/alerts";
import { MealHistory } from "@/pages/meal-history";
import { NutritionGoalsPage } from "@/pages/nutrition-goals";
import { FeatureGuide, useFeatureGuide } from "@/components/feature-guide";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { addMeal } from "@/lib/localStore";
import type { NutritionAnalysis } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState("camera");
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysis | null>(null);
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string>("");
  const [showMealHistory, setShowMealHistory] = useState(false);
  const [showNutritionGoals, setShowNutritionGoals] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isOpen: isGuideOpen, openGuide, closeGuide } = useFeatureGuide();

  const cameraMutation = useMutation({
    mutationFn: async (dataURL: string) => {
      const response = await apiRequest("POST", "/api/analyze-camera", { dataURL });
      return response.json();
    },
    onSuccess: (data: NutritionAnalysis, dataURL: string) => {
      setAnalysisResult(data);
      setAnalyzedImageUrl(dataURL);
      toast({
        title: "Analysis Complete",
        description: `Detected ${data.composition.length} food items`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Camera analysis failed",
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (dataURL: string) => {
      const response = await apiRequest("POST", "/api/analyze-image", { dataURL });
      return response.json();
    },
    onSuccess: (data: NutritionAnalysis, dataURL: string) => {
      setAnalysisResult(data);
      setAnalyzedImageUrl(dataURL);
      toast({
        title: "Analysis Complete",
        description: `Detected ${data.composition.length} food items`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Image analysis failed",
        variant: "destructive",
      });
    },
  });

  const saveMealMutation = useMutation({
    mutationFn: async (mealData: { 
      mealType: string; 
      name?: string; 
      notes?: string; 
      analysisData: NutritionAnalysis; 
      imageUrl?: string; 
    }) => {
      console.log('[Save Meal] Saving meal:', mealData.mealType);
      const savedMeal = addMeal(mealData);
      console.log('[Save Meal] Meal saved successfully:', savedMeal.id);
      return savedMeal;
    },
    onSuccess: (savedMeal) => {
      console.log('[Save Meal] Invalidating queries and refetching');
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.refetchQueries({ queryKey: ['meals'] });
      toast({
        title: "Makanan tersimpan!",
        description: "Makanan berhasil ditambahkan ke riwayat Anda.",
      });
    },
    onError: (error: Error) => {
      console.error('[Save Meal] Error saving meal:', error);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan",
        description: error.message || "Gagal menyimpan makanan",
      });
    },
  });

  const isAnalyzing = cameraMutation.isPending || uploadMutation.isPending;

  const handleCameraCapture = (dataURL: string) => {
    cameraMutation.mutate(dataURL);
  };

  const handleImageUpload = (dataURL: string) => {
    uploadMutation.mutate(dataURL);
  };

  // Handle navigation to other pages after all hooks are defined
  if (showMealHistory) {
    return <MealHistory onBack={() => setShowMealHistory(false)} />;
  }

  if (showNutritionGoals) {
    return <NutritionGoalsPage onBack={() => setShowNutritionGoals(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" fill="currentColor">
                  <path d="M12 2L13.09 7.26L18 4.27L15.91 9.53L22 8.5L16.36 11.5L22 16.5L15.91 14.47L18 19.73L13.09 16.74L12 22L10.91 16.74L6 19.73L8.09 14.47L2 16.5L7.64 11.5L2 8.5L8.09 9.53L6 4.27L10.91 7.26L12 2Z"/>
                  <path d="M12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8Z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-foreground truncate">Kids B-Care</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Food Nutrition Analysis</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                onClick={openGuide}
                className="flex items-center space-x-1 px-2 sm:px-3"
                size="sm"
                data-testid="button-help"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowNutritionGoals(true)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4"
                size="sm"
                data-testid="button-nutrition-goals"
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Goals</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowMealHistory(true)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4"
                size="sm"
                data-testid="button-meal-history"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
              <TabsTrigger 
                value="camera" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 py-2"
                data-testid="tab-camera"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Kamera</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 py-2"
                data-testid="tab-upload"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Unggah</span>
              </TabsTrigger>
            </TabsList>

            {/* Camera Panel */}
            <TabsContent value="camera" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <CameraPanel 
                  onCapture={handleCameraCapture}
                  isAnalyzing={isAnalyzing}
                />
                
                {/* Quick Preview */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-4 sm:pt-6">
                      <h3 className="text-base sm:text-lg font-semibold mb-3">Preview Nutrisi Cepat</h3>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-primary" data-testid="text-preview-calories">
                            {analysisResult?.totals.calories_kcal || 0}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Total kcal</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-secondary" data-testid="text-preview-items">
                            {analysisResult?.composition.length || 0}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Item Terdeteksi</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Upload Panel */}
            <TabsContent value="upload" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <UploadPanel 
                  onUpload={handleImageUpload}
                  isAnalyzing={isAnalyzing}
                />
                
                {/* Upload Preview */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-4 sm:pt-6">
                      <h3 className="text-base sm:text-lg font-semibold mb-3">Ringkasan Analisis</h3>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-primary" data-testid="text-summary-calories">
                            {analysisResult?.totals.calories_kcal || 0}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Total kcal</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-secondary" data-testid="text-summary-items">
                            {analysisResult?.composition.length || 0}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Item Terdeteksi</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Analysis Results */}
        {analysisResult && analyzedImageUrl && (
          <Card className="mt-6 sm:mt-8">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Hasil Analisis</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">Makanan terdeteksi dan rincian nutrisi</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const mealType = new Date().getHours() < 11 ? 'breakfast' : 
                                     new Date().getHours() < 16 ? 'lunch' : 'dinner';
                      saveMealMutation.mutate({
                        mealType,
                        analysisData: analysisResult,
                        imageUrl: analyzedImageUrl,
                      });
                    }}
                    disabled={saveMealMutation.isPending}
                    className="flex items-center space-x-1 sm:space-x-2 text-sm"
                    size="sm"
                    data-testid="button-save-meal"
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Simpan Makanan</span>
                    <span className="sm:hidden">Simpan</span>
                  </Button>
                  <Downloads analysis={analysisResult} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {/* Results Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Image with Overlays */}
                <div className="space-y-3 sm:space-y-4">
                  <OverlayCanvas
                    imageUrl={analyzedImageUrl}
                    foodItems={analysisResult.composition}
                    imageMeta={analysisResult.image_meta}
                    className="aspect-video bg-muted rounded-lg overflow-hidden"
                  />
                  
                  {/* Detection Summary */}
                  <Card className="bg-muted">
                    <CardContent className="pt-3 sm:pt-4">
                      <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Ringkasan Deteksi</h3>
                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center justify-between">
                          <span>Item Terdeteksi:</span>
                          <span className="font-medium" data-testid="text-items-detected">
                            {analysisResult.composition.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Ukuran Gambar:</span>
                          <span className="font-medium">
                            {analysisResult.image_meta.width} × {analysisResult.image_meta.height}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Nutrition Information */}
                <NutritionTables analysis={analysisResult} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Educational Disclaimer */}
        <div className="mt-8">
          <EducationalDisclaimer />
        </div>
      </main>

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isAnalyzing} />
      
      {/* Feature Guide */}
      <FeatureGuide isOpen={isGuideOpen} onClose={closeGuide} />
    </div>
  );
}
