import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, History, Download, Save, Target, ChevronRight, ChevronLeft, X } from "lucide-react";

interface FeatureGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: Camera,
    title: "Scan Kamera",
    description: "Gunakan kamera untuk scan makanan secara langsung",
    steps: [
      "Klik tab 'Kamera' di halaman utama",
      "Pilih kamera depan atau belakang",
      "Klik tombol 'Mulai Kamera' untuk aktifkan preview",
      "Arahkan kamera ke makanan dengan pencahayaan yang baik",
      "Klik tombol kamera (bulat biru) untuk capture",
      "Tunggu analisis selesai untuk lihat hasil nutrisi"
    ],
    color: "bg-blue-500"
  },
  {
    icon: Upload,
    title: "Unggah Gambar",
    description: "Unggah foto makanan dari galeri",
    steps: [
      "Klik tab 'Unggah' di halaman utama",
      "Klik area unggah atau drag & drop gambar",
      "Pilih foto makanan dari galeri",
      "Tunggu proses unggah dan analisis",
      "Lihat hasil deteksi makanan dan nutrisi"
    ],
    color: "bg-green-500"
  },
  {
    icon: Save,
    title: "Simpan Makanan",
    description: "Simpan hasil analisis ke riwayat",
    steps: [
      "Setelah analisis selesai, scroll ke bagian hasil",
      "Klik tombol 'Simpan Makanan' di pojok kanan atas",
      "Makanan otomatis tersimpan dengan waktu saat ini",
      "Data tersimpan di perangkat Anda (offline)",
      "Akses kapan saja di menu Riwayat"
    ],
    color: "bg-purple-500"
  },
  {
    icon: History,
    title: "Riwayat Makanan",
    description: "Lihat dan kelola riwayat makanan Anda",
    steps: [
      "Klik tombol 'Riwayat' di header (ikon History)",
      "Lihat semua makanan yang pernah di-scan",
      "Filter berdasarkan periode (7 hari, 30 hari, semua)",
      "Lihat ringkasan total kalori dan nutrisi",
      "Hapus makanan dengan tombol sampah (merah)",
      "Download riwayat dalam format JSON, CSV, atau TXT"
    ],
    color: "bg-orange-500"
  },
  {
    icon: Download,
    title: "Export Data",
    description: "Download riwayat dalam berbagai format",
    steps: [
      "Buka halaman Riwayat",
      "Pilih periode filter yang diinginkan",
      "Klik tombol download (JSON, CSV, atau TXT)",
      "JSON: Data lengkap untuk backup",
      "CSV: Buka di Excel untuk analisis",
      "TXT: Laporan lengkap yang mudah dibaca"
    ],
    color: "bg-pink-500"
  },
  {
    icon: Target,
    title: "Goals Nutrisi",
    description: "Atur dan pantau target nutrisi harian",
    steps: [
      "Klik tombol 'Target' di header (ikon Goals)",
      "Lihat rekomendasi kebutuhan nutrisi harian",
      "Bandingkan dengan konsumsi aktual Anda",
      "Pantau progress kalori, protein, karbo, dan lemak",
      "Sesuaikan pola makan berdasarkan target"
    ],
    color: "bg-teal-500"
  }
];

export function FeatureGuide({ isOpen, onClose }: FeatureGuideProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < features.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClose = () => {
    setCurrentPage(0);
    onClose();
  };

  const currentFeature = features[currentPage];
  const Icon = currentFeature.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl">Panduan Fitur Kids B-Care</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 flex-shrink-0"
              data-testid="button-close-guide"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            Pelajari cara menggunakan semua fitur aplikasi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Feature Card */}
          <Card className={`${currentFeature.color} text-white`}>
            <CardContent className="pt-4 sm:pt-6 pb-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold truncate">{currentFeature.title}</h3>
                  <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{currentFeature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-semibold text-sm sm:text-base md:text-lg">Langkah-langkah:</h4>
            <div className="space-y-2">
              {currentFeature.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-muted rounded-lg"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-xs sm:text-sm flex-1 pt-0.5 break-words">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                    index === currentPage
                      ? "bg-primary w-6 sm:w-8"
                      : "bg-muted-foreground/30 w-1.5 sm:w-2"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="flex-1 sm:flex-none"
                data-testid="button-guide-prev"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="sm:inline">Sebelumnya</span>
              </Button>
              {currentPage < features.length - 1 ? (
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="flex-1 sm:flex-none"
                  data-testid="button-guide-next"
                >
                  <span className="sm:inline">Selanjutnya</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleClose}
                  className="flex-1 sm:flex-none"
                  data-testid="button-guide-finish"
                >
                  Selesai
                </Button>
              )}
            </div>
          </div>

          {/* Progress Text */}
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Fitur {currentPage + 1} dari {features.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useFeatureGuide() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("hasSeenFeatureGuide");
    if (!hasSeenGuide) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const openGuide = () => setIsOpen(true);

  const closeGuide = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenFeatureGuide", "true");
  };

  return { isOpen, openGuide, closeGuide };
}
