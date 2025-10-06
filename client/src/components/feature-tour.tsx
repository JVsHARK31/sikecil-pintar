import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, History, Download, Save, Target, X, ChevronRight, ChevronLeft, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TourStep {
  target: string;
  title: string;
  description: string;
  icon: any;
  position: "top" | "bottom" | "left" | "right" | "center";
  highlightPadding?: number;
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='welcome']",
    title: "Selamat Datang di Kids B-Care! 🎉",
    description: "Mari kita kenali fitur-fitur utama aplikasi analisis nutrisi makanan ini. Anda bisa skip tutorial kapan saja dengan klik tombol 'Lewati'.",
    icon: null,
    position: "center",
  },
  {
    target: "[data-tour='camera-tab']",
    title: "📸 Scan dengan Kamera",
    description: "Gunakan kamera HP untuk scan makanan secara langsung. Klik tab 'Kamera' untuk mulai mengambil foto makanan real-time.",
    icon: Camera,
    position: "bottom",
    highlightPadding: 8,
  },
  {
    target: "[data-tour='upload-tab']",
    title: "📁 Unggah Gambar",
    description: "Atau unggah foto makanan dari galeri HP Anda. Drag & drop juga didukung untuk kemudahan.",
    icon: Upload,
    position: "bottom",
    highlightPadding: 8,
  },
  {
    target: "[data-tour='history-button']",
    title: "📊 Riwayat Makanan",
    description: "Lihat semua makanan yang pernah di-scan. Data tersimpan di perangkat Anda dan bisa difilter berdasarkan periode.",
    icon: History,
    position: "bottom",
    highlightPadding: 12,
  },
  {
    target: "[data-tour='goals-button']",
    title: "🎯 Target Nutrisi",
    description: "Pantau progress nutrisi harian Anda. Bandingkan konsumsi aktual dengan target kalori, protein, karbo, dan lemak.",
    icon: Target,
    position: "bottom",
    highlightPadding: 12,
  },
  {
    target: "[data-tour='analyze-area']",
    title: "🔍 Area Analisis",
    description: "Hasil analisis makanan akan muncul di sini. Anda akan melihat komposisi makanan, nutrisi lengkap, dan visualisasi bounding box.",
    icon: null,
    position: "top",
    highlightPadding: 16,
  },
  {
    target: "[data-tour='welcome']",
    title: "✅ Siap Digunakan!",
    description: "Anda sudah mengenal semua fitur utama. Sekarang coba scan makanan pertama Anda! Klik 'Selesai' untuk mulai.",
    icon: null,
    position: "center",
  },
];

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeatureTour({ isOpen, onClose }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    const updateHighlight = () => {
      const target = document.querySelector(currentTourStep.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setHighlightRect(rect);
        
        // Auto-scroll element into view if not fully visible
        if (currentTourStep.position !== "center") {
          const isInView = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
          );
          
          if (!isInView) {
            target.scrollIntoView({ 
              behavior: "smooth", 
              block: "center",
              inline: "center"
            });
          }
        }
      } else {
        setHighlightRect(null);
      }
    };

    // Delay untuk ensure smooth transition
    setTimeout(updateHighlight, 100);
    
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight);

    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight);
    };
  }, [currentStep, isOpen, currentTourStep.target, currentTourStep.position]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(0);
    setHighlightRect(null);
    localStorage.setItem("hasSeenFeatureTour", "true");
    onClose();
  };

  if (!isOpen) return null;

  const padding = currentTourStep.highlightPadding || 0;
  const Icon = currentTourStep.icon;

  const getTooltipPosition = () => {
    if (!highlightRect || currentTourStep.position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    // Responsive sizing - smaller on mobile
    const isMobile = window.innerWidth < 640; // sm breakpoint
    const tooltipWidth = isMobile ? Math.min(window.innerWidth - 32, 380) : 400; // 16px padding each side on mobile
    const tooltipHeight = 280; // Approximate height
    const offset = isMobile ? 12 : 20;
    const margin = isMobile ? 16 : 20;

    // Calculate available space
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    switch (currentTourStep.position) {
      case "bottom":
        const bottomSpace = viewportHeight - highlightRect.bottom - offset;
        
        // If not enough space below, position above instead
        if (bottomSpace < tooltipHeight && highlightRect.top > tooltipHeight + offset) {
          return {
            top: `${Math.max(margin, highlightRect.top - tooltipHeight - offset)}px`,
            left: `${margin}px`,
            right: `${margin}px`,
          };
        }
        
        return {
          top: `${highlightRect.bottom + offset}px`,
          left: `${margin}px`,
          right: `${margin}px`,
        };
      
      case "top":
        const topSpace = highlightRect.top - offset;
        
        // If not enough space above, position below instead
        if (topSpace < tooltipHeight && (viewportHeight - highlightRect.bottom) > tooltipHeight + offset) {
          return {
            top: `${highlightRect.bottom + offset}px`,
            left: `${margin}px`,
            right: `${margin}px`,
          };
        }
        
        return {
          top: `${Math.max(margin, highlightRect.top - tooltipHeight - offset)}px`,
          left: `${margin}px`,
          right: `${margin}px`,
        };
      
      case "left":
      case "right":
        // On mobile, always position below to avoid horizontal cropping
        if (isMobile) {
          return {
            top: `${highlightRect.bottom + offset}px`,
            left: `${margin}px`,
            right: `${margin}px`,
          };
        }
        
        // Desktop left/right positioning
        const isLeft = currentTourStep.position === "left";
        const horizontalSpace = isLeft ? highlightRect.left : (viewportWidth - highlightRect.right);
        
        if (horizontalSpace < tooltipWidth + offset) {
          // Not enough space, position below
          return {
            top: `${highlightRect.bottom + offset}px`,
            left: `${margin}px`,
            right: `${margin}px`,
          };
        }
        
        return {
          top: `${Math.max(margin, Math.min(viewportHeight - tooltipHeight - margin, highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2))}px`,
          left: isLeft ? `${Math.max(margin, highlightRect.left - tooltipWidth - offset)}px` : `${Math.min(viewportWidth - tooltipWidth - margin, highlightRect.right + offset)}px`,
        };
      
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ pointerEvents: "auto" }}
      >
        {/* Backdrop Overlay with Spotlight */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" style={{ pointerEvents: "none" }}>
          {highlightRect && currentTourStep.position !== "center" && (
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={highlightRect.left - padding}
                    y={highlightRect.top - padding}
                    width={highlightRect.width + padding * 2}
                    height={highlightRect.height + padding * 2}
                    rx="8"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.7)"
                mask="url(#spotlight-mask)"
              />
            </svg>
          )}
        </div>

        {/* Highlight Box */}
        {highlightRect && currentTourStep.position !== "center" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute border-4 border-primary rounded-lg shadow-xl shadow-primary/50"
            style={{
              top: `${highlightRect.top - padding}px`,
              left: `${highlightRect.left - padding}px`,
              width: `${highlightRect.width + padding * 2}px`,
              height: `${highlightRect.height + padding * 2}px`,
              pointerEvents: "none",
            }}
          >
            {/* Animated corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary animate-pulse" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary animate-pulse" />
          </motion.div>
        )}

        {/* Tooltip Card */}
        <motion.div
          key={currentStep}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="absolute"
          style={{
            ...getTooltipPosition(),
            pointerEvents: "auto",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Card className="shadow-2xl border-2 border-primary/50">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {Icon && (
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                  )}
                  <CardTitle className="text-sm sm:text-base md:text-lg leading-tight break-words">{currentTourStep.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                  data-testid="button-skip-tour"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 pb-3 sm:pb-4">
              <CardDescription className="text-xs sm:text-sm leading-relaxed break-words">
                {currentTourStep.description}
              </CardDescription>

              {/* Progress Dots */}
              <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 py-1.5 sm:py-2">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentStep
                        ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-primary"
                        : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    data-testid={`tour-dot-${index}`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t gap-1.5 sm:gap-2">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    data-testid="button-tour-prev"
                    className="text-xs px-2 h-7 sm:h-8"
                  >
                    <ChevronLeft className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline text-xs">Kembali</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-muted-foreground text-xs px-2 h-7 sm:h-8"
                    data-testid="button-tour-skip"
                  >
                    <SkipForward className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline text-xs">Lewati</span>
                  </Button>
                </div>

                <Button
                  size="sm"
                  onClick={handleNext}
                  data-testid="button-tour-next"
                  className="text-xs px-2.5 sm:px-3 h-7 sm:h-8"
                >
                  {currentStep === tourSteps.length - 1 ? "Selesai" : "Lanjut"}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {/* Step Counter */}
              <p className="text-center text-xs text-muted-foreground pt-0.5">
                Langkah {currentStep + 1} dari {tourSteps.length}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook untuk manage feature tour
export function useFeatureTour() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenFeatureTour");
    if (!hasSeenTour) {
      // Delay untuk ensure semua elements sudah di-render
      setTimeout(() => setIsOpen(true), 1500);
    }
  }, []);

  const openTour = () => setIsOpen(true);

  const closeTour = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenFeatureTour", "true");
  };

  const resetTour = () => {
    localStorage.removeItem("hasSeenFeatureTour");
    setIsOpen(true);
  };

  return { isOpen, openTour, closeTour, resetTour };
}
