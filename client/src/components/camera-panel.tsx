import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, RotateCcw, Play, Square, SwitchCamera, Video } from "lucide-react";
import { resizeImageIfNeeded } from "@/lib/image";
import { useToast } from "@/hooks/use-toast";

interface CameraPanelProps {
  onCapture: (dataURL: string) => void;
  isAnalyzing: boolean;
}

export function CameraPanel({ onCapture, isAnalyzing }: CameraPanelProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string>("");
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Get available camera devices
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          // Prefer back camera on mobile
          const backCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          setSelectedDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
        }
      })
      .catch(err => {
        console.error('Error enumerating devices:', err);
        setError('Tidak dapat mengakses perangkat kamera');
      });

    return () => {
      stopStream();
    };
  }, []);

  const startStream = async () => {
    try {
      setError("");
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: selectedDeviceId ? undefined : { ideal: facingMode },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video metadata to load
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play()
                .then(() => {
                  setIsStreaming(true);
                  toast({
                    title: "Kamera Aktif",
                    description: facingMode === "environment" ? "Kamera belakang digunakan" : "Kamera depan digunakan",
                  });
                  resolve();
                })
                .catch((err) => {
                  console.error('Error playing video:', err);
                  setError('Gagal memutar video preview');
                  resolve();
                });
            };
          }
        });
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Tidak dapat mengakses kamera. Periksa izin kamera.');
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
    setIsStreaming(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
    
    let dataURL = canvas.toDataURL('image/jpeg', 0.7);
    
    // Resize and compress to match upload limits
    dataURL = await resizeImageIfNeeded(dataURL, 800);
    
    // Check compressed size - same as upload path
    if (dataURL.length > 512 * 1024) {
      setError('Gambar terlalu besar. Coba dengan pencahayaan lebih baik atau sudut yang berbeda.');
      return;
    }
    
    onCapture(dataURL);
  };

  const switchCamera = async () => {
    // Toggle between front and back camera
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
    
    // Restart stream with new facing mode
    if (isStreaming) {
      stopStream();
      setTimeout(() => {
        setError("");
        startStream();
      }, 100);
    }
    
    toast({
      title: "Beralih Kamera",
      description: newFacingMode === "environment" ? "Menggunakan kamera belakang" : "Menggunakan kamera depan",
    });
  };

  // Restart stream when device changes
  useEffect(() => {
    if (isStreaming && selectedDeviceId) {
      stopStream();
      setTimeout(startStream, 100);
    }
  }, [selectedDeviceId]);

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
                Posisikan makanan dengan jelas di tampilan kamera
              </p>
            </div>
            {isStreaming && (
              <Badge variant="default" className="flex items-center space-x-1">
                <Video className="w-3 h-3" />
                <span className="text-xs">
                  {facingMode === "environment" ? "Belakang" : "Depan"}
                </span>
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                <div className="text-center p-4">
                  <Camera className="w-12 h-12 text-destructive mx-auto mb-2" />
                  <p className="text-destructive text-sm">{error}</p>
                  <Button 
                    onClick={startStream} 
                    variant="outline"
                    className="mt-3"
                    data-testid="button-retry-camera"
                  >
                    Coba Lagi
                  </Button>
                </div>
              </div>
            ) : !isStreaming ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-foreground text-sm mb-4 px-4">Tekan tombol untuk mulai kamera</p>
                  <Button 
                    onClick={startStream} 
                    size="lg"
                    className="shadow-lg"
                    data-testid="button-start-camera"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Mulai Kamera
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                  data-testid="video-camera-preview"
                />
                
                {/* Camera Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="grid" width="33.33" height="33.33" patternUnits="userSpaceOnUse">
                        <path d="M 33.33 0 L 0 0 0 33.33" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Camera Info Top */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                    <Video className="w-3 h-3 mr-1" />
                    {facingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
                  </Badge>
                  <Button
                    onClick={switchCamera}
                    variant="secondary"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                    data-testid="button-switch-camera"
                  >
                    <SwitchCamera className="w-4 h-4 mr-2" />
                    Ganti
                  </Button>
                </div>

                {/* Camera Controls Overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
                  <Button
                    onClick={stopStream}
                    variant="destructive"
                    className="p-3 rounded-full shadow-lg"
                    data-testid="button-stop-camera"
                  >
                    <Square className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    onClick={captureImage}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg scale-110"
                    disabled={isAnalyzing}
                    data-testid="button-capture-image"
                  >
                    <Camera className="w-7 h-7" />
                  </Button>
                  
                  <Button
                    onClick={switchCamera}
                    variant="secondary"
                    className="p-3 rounded-full shadow-lg bg-white/90 hover:bg-white"
                    data-testid="button-switch-camera-bottom"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Camera Controls */}
          <div className="space-y-3">
            {!isStreaming && (
              <Button
                onClick={startStream}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                data-testid="button-start-camera-main"
              >
                <Play className="w-4 h-4 mr-2" />
                Mulai Kamera
              </Button>
            )}
            
            {isStreaming && (
              <Button
                onClick={captureImage}
                disabled={isAnalyzing}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                size="lg"
                data-testid="button-analyze-camera"
              >
                {isAnalyzing ? "Menganalisis..." : "Analisis Makanan"}
              </Button>
            )}

            {devices.length > 1 && isStreaming && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Pilih Kamera:</span>
                <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                  <SelectTrigger className="w-48" data-testid="select-camera-device">
                    <SelectValue placeholder="Pilih kamera" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices
                      .filter(device => device.deviceId && device.deviceId.trim() !== '')
                      .map((device, index) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Kamera ${index + 1}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
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
              <span>Pegang kamera dengan stabil untuk hasil yang jelas</span>
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
