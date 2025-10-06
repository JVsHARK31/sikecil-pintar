import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, RotateCcw, Play, Square, SwitchCamera, Video, X } from "lucide-react";
import { resizeImageIfNeeded } from "@/lib/image";
import { useToast } from "@/hooks/use-toast";

interface CameraPanelProps {
  onCapture: (dataURL: string) => void;
  isAnalyzing: boolean;
}

export function CameraPanel({ onCapture, isAnalyzing }: CameraPanelProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const startStream = async () => {
    try {
      setError("");
      setCapturedImage(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false
      };

      console.log('[Camera] Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[Camera] Got stream:', stream.id);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for metadata and play
        videoRef.current.onloadedmetadata = async () => {
          console.log('[Camera] Video metadata loaded');
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              console.log('[Camera] Video playing');
              setIsStreaming(true);
              toast({
                title: "Kamera Aktif",
                description: facingMode === "environment" ? "Menggunakan kamera belakang" : "Menggunakan kamera depan",
              });
            } catch (err) {
              console.error('[Camera] Error playing video:', err);
              setError('Gagal memutar video preview');
            }
          }
        };
      }
    } catch (err) {
      console.error('[Camera] Error starting camera:', err);
      setError('Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin akses kamera.');
      toast({
        variant: "destructive",
        title: "Kamera Gagal",
        description: "Pastikan Anda telah memberikan izin akses kamera",
      });
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame
    ctx.drawImage(video, 0, 0);
    
    // Get image as data URL
    let dataURL = canvas.toDataURL('image/jpeg', 0.85);
    
    // Resize if needed
    dataURL = await resizeImageIfNeeded(dataURL, 800);
    
    // Check size
    if (dataURL.length > 512 * 1024) {
      toast({
        variant: "destructive",
        title: "Gambar Terlalu Besar",
        description: "Coba dengan pencahayaan lebih baik",
      });
      return;
    }
    
    // Set captured image for preview
    setCapturedImage(dataURL);
    
    // Stop camera stream
    stopStream();
    
    toast({
      title: "Foto Diambil",
      description: "Klik 'Analisis Gambar' untuk memproses",
    });
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startStream();
  };

  const analyzeImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const switchCamera = () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
    
    if (isStreaming) {
      stopStream();
      setTimeout(() => {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: newFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
          .then(stream => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              streamRef.current = stream;
              videoRef.current.play()
                .then(() => {
                  setIsStreaming(true);
                  toast({
                    title: "Kamera Berubah",
                    description: newFacingMode === "environment" ? "Menggunakan kamera belakang" : "Menggunakan kamera depan",
                  });
                });
            }
          })
          .catch(err => {
            console.error('Error switching camera:', err);
            setError('Gagal beralih kamera');
          });
      }, 300);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Analisis Kamera</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ambil foto makanan dengan kamera
              </p>
            </div>
            {isStreaming && (
              <Badge variant="default" className="flex items-center space-x-1">
                <Video className="w-3 h-3 animate-pulse" />
                <span className="text-xs">
                  {facingMode === "environment" ? "Belakang" : "Depan"}
                </span>
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera/Image Preview Area */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg border-2 border-border">
            
            {/* Video Element - Always present in DOM */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                isStreaming && !capturedImage ? 'block' : 'hidden'
              }`}
              style={{ 
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
              data-testid="video-camera-preview"
            />

            {/* Camera Grid Overlay */}
            {isStreaming && !capturedImage && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="camera-grid" width="33.33" height="33.33" patternUnits="userSpaceOnUse">
                      <path d="M 33.33 0 L 0 0 0 33.33" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#camera-grid)" />
                </svg>
              </div>
            )}

            {/* Camera Controls Overlay */}
            {isStreaming && !capturedImage && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
                <div className="flex items-center justify-center space-x-4">
                  {/* Stop Camera */}
                  <Button
                    onClick={stopStream}
                    variant="destructive"
                    size="icon"
                    className="w-12 h-12 rounded-full shadow-lg"
                    data-testid="button-stop-camera"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                  
                  {/* Capture Photo */}
                  <Button
                    onClick={capturePhoto}
                    size="icon"
                    className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 text-primary shadow-xl border-4 border-primary"
                    data-testid="button-capture-photo"
                  >
                    <Camera className="w-8 h-8" />
                  </Button>
                  
                  {/* Switch Camera */}
                  <Button
                    onClick={switchCamera}
                    variant="secondary"
                    size="icon"
                    className="w-12 h-12 rounded-full shadow-lg"
                    data-testid="button-switch-camera"
                  >
                    <SwitchCamera className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}

            {/* Top Info Bar */}
            {isStreaming && !capturedImage && (
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <Badge className="bg-black/50 text-white border-white/30">
                  <Video className="w-3 h-3 mr-1 animate-pulse" />
                  Kamera Aktif
                </Badge>
                <Button
                  onClick={switchCamera}
                  size="sm"
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/70 text-white border-white/30"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Ganti
                </Button>
              </div>
            )}

            {/* Error State */}
            {error && !isStreaming && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 z-10">
                <div className="text-center p-4">
                  <Camera className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <p className="text-red-500 text-sm mb-3">{error}</p>
                  <Button 
                    onClick={startStream} 
                    variant="outline"
                    data-testid="button-retry-camera"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Coba Lagi
                  </Button>
                </div>
              </div>
            )}

            {/* Initial State - Not Streaming */}
            {!isStreaming && !capturedImage && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 z-10">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Camera className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-4">Ambil Foto Makanan</p>
                  <Button 
                    onClick={startStream} 
                    size="lg"
                    className="shadow-lg"
                    data-testid="button-start-camera"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Mulai Kamera
                  </Button>
                </div>
              </div>
            )}

            {/* Captured Image Preview */}
            {capturedImage && (
              <>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="absolute inset-0 w-full h-full object-contain z-20"
                  data-testid="img-captured-preview"
                />
                
                {/* Retake Button Overlay */}
                <div className="absolute top-4 right-4 z-30">
                  <Button
                    onClick={retakePhoto}
                    variant="secondary"
                    size="sm"
                    className="shadow-lg"
                    data-testid="button-retake-photo"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Ambil Ulang
                  </Button>
                </div>

                {/* Preview Badge */}
                <div className="absolute top-4 left-4 z-30">
                  <Badge className="bg-green-500 text-white">
                    <Camera className="w-3 h-3 mr-1" />
                    Foto Siap
                  </Badge>
                </div>
              </>
            )}
          </div>

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isStreaming && !capturedImage && !error && (
              <Button
                onClick={startStream}
                className="w-full"
                size="lg"
                data-testid="button-start-camera-main"
              >
                <Play className="w-5 h-5 mr-2" />
                Mulai Kamera
              </Button>
            )}

            {isStreaming && !capturedImage && (
              <Button
                onClick={capturePhoto}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                data-testid="button-capture-main"
              >
                <Camera className="w-5 h-5 mr-2" />
                Ambil Foto
              </Button>
            )}

            {capturedImage && (
              <div className="space-y-2">
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  size="lg"
                  data-testid="button-analyze-captured"
                >
                  {isAnalyzing ? "Menganalisis..." : "Analisis Gambar"}
                </Button>
                
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  data-testid="button-retake-main"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Ambil Foto Ulang
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Camera Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
            <Camera className="w-4 h-4 mr-2" />
            Tips Kamera
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">💡</span>
              <span>Pastikan pencahayaan yang baik pada makanan</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📱</span>
              <span>Pegang kamera dengan stabil saat mengambil foto</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎯</span>
              <span>Posisikan makanan dalam grid kamera</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✨</span>
              <span>Hindari bayangan dan pantulan cahaya</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔄</span>
              <span>Gunakan tombol "Ganti" untuk beralih kamera depan/belakang</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
