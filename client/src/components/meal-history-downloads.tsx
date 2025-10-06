import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { LocalMeal } from "@/lib/localStore";
import { downloadMealsJSON, downloadMealsCSV, downloadMealsTXT } from "@/lib/csv";
import { useToast } from "@/hooks/use-toast";

interface MealHistoryDownloadsProps {
  meals: LocalMeal[];
  period?: string;
}

export function MealHistoryDownloads({ meals, period = 'all' }: MealHistoryDownloadsProps) {
  const { toast } = useToast();

  const getTimestamp = () => {
    return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  };

  const handleExportJSON = () => {
    try {
      if (meals.length === 0) {
        toast({
          title: "Tidak ada data",
          description: "Tidak ada riwayat makanan untuk di-export",
          variant: "destructive",
        });
        return;
      }

      const timestamp = getTimestamp();
      downloadMealsJSON(meals, `meal-history-${period}-${timestamp}.json`);
      toast({
        title: "Export Berhasil",
        description: `${meals.length} makanan telah di-export ke JSON`,
      });
    } catch (error) {
      toast({
        title: "Export Gagal",
        description: "Gagal meng-export file JSON",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      if (meals.length === 0) {
        toast({
          title: "Tidak ada data",
          description: "Tidak ada riwayat makanan untuk di-export",
          variant: "destructive",
        });
        return;
      }

      const timestamp = getTimestamp();
      downloadMealsCSV(meals, `meal-history-${period}-${timestamp}.csv`);
      toast({
        title: "Export Berhasil",
        description: `${meals.length} makanan telah di-export ke CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Gagal",
        description: "Gagal meng-export file CSV",
        variant: "destructive",
      });
    }
  };

  const handleExportTXT = () => {
    try {
      if (meals.length === 0) {
        toast({
          title: "Tidak ada data",
          description: "Tidak ada riwayat makanan untuk di-export",
          variant: "destructive",
        });
        return;
      }

      const timestamp = getTimestamp();
      downloadMealsTXT(meals, `meal-history-${period}-${timestamp}.txt`);
      toast({
        title: "Export Berhasil",
        description: `${meals.length} makanan telah di-export ke TXT`,
      });
    } catch (error) {
      toast({
        title: "Export Gagal",
        description: "Gagal meng-export file TXT",
        variant: "destructive",
      });
    }
  };

  const isDisabled = meals.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleExportJSON}
        variant="outline"
        size="sm"
        disabled={isDisabled}
        className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
        data-testid="button-export-history-json"
      >
        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
        <span className="hidden sm:inline">Download JSON</span>
        <span className="sm:hidden ml-1">JSON</span>
      </Button>
      <Button
        onClick={handleExportCSV}
        variant="outline"
        size="sm"
        disabled={isDisabled}
        className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
        data-testid="button-export-history-csv"
      >
        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
        <span className="hidden sm:inline">Download CSV</span>
        <span className="sm:hidden ml-1">CSV</span>
      </Button>
      <Button
        onClick={handleExportTXT}
        variant="outline"
        size="sm"
        disabled={isDisabled}
        className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
        data-testid="button-export-history-txt"
      >
        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
        <span className="hidden sm:inline">Download TXT</span>
        <span className="sm:hidden ml-1">TXT</span>
      </Button>
    </div>
  );
}
