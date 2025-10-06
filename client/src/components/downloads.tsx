import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { NutritionAnalysis } from "@shared/schema";
import { downloadJSON, downloadCSV, downloadTXT } from "@/lib/csv";
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

  const handleExportTXT = () => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadTXT(analysis, `nutrition-analysis-${timestamp}.txt`);
      toast({
        title: "Export Successful",
        description: "TXT file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export TXT file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleExportJSON}
        variant="outline"
        size="sm"
        className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
        data-testid="button-export-json"
      >
        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
        <span className="hidden sm:inline">Export JSON</span>
        <span className="sm:hidden ml-1">JSON</span>
      </Button>
      <Button
        onClick={handleExportCSV}
        variant="outline"
        size="sm"
        className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
        data-testid="button-export-csv"
      >
        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
        <span className="hidden sm:inline">Export CSV</span>
        <span className="sm:hidden ml-1">CSV</span>
      </Button>
      <Button
        onClick={handleExportTXT}
        variant="outline"
        size="sm"
        className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
        data-testid="button-export-txt"
      >
        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
        <span className="hidden sm:inline">Export TXT</span>
        <span className="sm:hidden ml-1">TXT</span>
      </Button>
    </div>
  );
}
