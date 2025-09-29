import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { NutritionAnalysis } from "@shared/schema";
import { downloadJSON, downloadCSV } from "@/lib/csv";
import { useToast } from "@/hooks/use-toast";

interface DownloadsProps {
  analysis: NutritionAnalysis;
}

export function Downloads({ analysis }: DownloadsProps) {
  const { toast } = useToast();

  const handleExportJSON = () => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadJSON(analysis, `nutrition-analysis-${timestamp}.json`);
      toast({
        title: "Export Successful",
        description: "JSON file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export JSON file",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadCSV(analysis, `nutrition-analysis-${timestamp}.csv`);
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={handleExportJSON}
        variant="outline"
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
        data-testid="button-export-json"
      >
        <Download className="w-4 h-4 mr-2" />
        Export JSON
      </Button>
      <Button
        onClick={handleExportCSV}
        variant="outline"
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
        data-testid="button-export-csv"
      >
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
}
