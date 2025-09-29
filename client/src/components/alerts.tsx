import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export function EducationalDisclaimer() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Educational Purpose Only</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              This nutritional analysis is for educational and informational purposes only. 
              Results are estimates based on visual analysis and may not be completely accurate. 
              Always consult healthcare professionals for personalized dietary advice, especially 
              for children with specific nutritional needs or medical conditions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Food Items...</h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we identify and analyze the nutritional content of your food.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
