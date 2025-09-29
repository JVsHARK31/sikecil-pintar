import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { CameraPanel } from "@/components/camera-panel";
import { UploadPanel } from "@/components/upload-panel";
import { OverlayCanvas } from "@/components/overlay-canvas";
import { NutritionTables } from "@/components/nutrition-tables";
import { Downloads } from "@/components/downloads";
import { EducationalDisclaimer, LoadingOverlay } from "@/components/alerts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { NutritionAnalysis } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState("camera");
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysis | null>(null);
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string>("");
  const { toast } = useToast();

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

  const isAnalyzing = cameraMutation.isPending || uploadMutation.isPending;

  const handleCameraCapture = (dataURL: string) => {
    cameraMutation.mutate(dataURL);
  };

  const handleImageUpload = (dataURL: string) => {
    uploadMutation.mutate(dataURL);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="currentColor">
                  <path d="M12 2L13.09 7.26L18 4.27L15.91 9.53L22 8.5L16.36 11.5L22 16.5L15.91 14.47L18 19.73L13.09 16.74L12 22L10.91 16.74L6 19.73L8.09 14.47L2 16.5L7.64 11.5L2 8.5L8.09 9.53L6 4.27L10.91 7.26L12 2Z"/>
                  <path d="M12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Kids B-Care</h1>
                <p className="text-sm text-muted-foreground">Food Nutrition Analysis</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
              <TabsTrigger 
                value="camera" 
                className="flex items-center space-x-2"
                data-testid="tab-camera"
              >
                <Camera className="w-5 h-5" />
                <span>Camera</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="flex items-center space-x-2"
                data-testid="tab-upload"
              >
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </TabsTrigger>
            </TabsList>

            {/* Camera Panel */}
            <TabsContent value="camera" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CameraPanel 
                  onCapture={handleCameraCapture}
                  isAnalyzing={isAnalyzing}
                />
                
                {/* Quick Preview */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">Quick Nutrition Preview</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary" data-testid="text-preview-calories">
                            {analysisResult?.totals.calories_kcal || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Total kcal</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-secondary" data-testid="text-preview-items">
                            {analysisResult?.composition.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Items Detected</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Upload Panel */}
            <TabsContent value="upload" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UploadPanel 
                  onUpload={handleImageUpload}
                  isAnalyzing={isAnalyzing}
                />
                
                {/* Upload Preview */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">Analysis Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary" data-testid="text-summary-calories">
                            {analysisResult?.totals.calories_kcal || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Total kcal</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-secondary" data-testid="text-summary-items">
                            {analysisResult?.composition.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Items Detected</div>
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
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <p className="text-muted-foreground">Detected food items and nutritional breakdown</p>
                </div>
                <Downloads analysis={analysisResult} />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Results Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image with Overlays */}
                <div className="space-y-4">
                  <OverlayCanvas
                    imageUrl={analyzedImageUrl}
                    foodItems={analysisResult.composition}
                    imageMeta={analysisResult.image_meta}
                    className="aspect-video bg-muted rounded-lg overflow-hidden"
                  />
                  
                  {/* Detection Summary */}
                  <Card className="bg-muted">
                    <CardContent className="pt-4">
                      <h3 className="font-semibold mb-3">Detection Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Items Detected:</span>
                          <span className="font-medium" data-testid="text-items-detected">
                            {analysisResult.composition.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Analysis Model:</span>
                          <span className="font-medium">
                            {activeTab === 'camera' ? 'GPT-5 Nano' : 'GEMINI 2.0 Flash'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Image Size:</span>
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
    </div>
  );
}
