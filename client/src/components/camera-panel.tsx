import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, RotateCcw, Play, Square } from "lucide-react";
import { resizeImageIfNeeded } from "@/lib/image";

interface CameraPanelProps {
  onCapture: (dataURL: string) => void;
  isAnalyzing: boolean;
}

export function CameraPanel({ onCapture, isAnalyzing }: CameraPanelProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [error, setError] = useState<string>("");
  
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
        setError('Unable to access camera devices');
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
          facingMode: selectedDeviceId ? undefined : { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Unable to start camera. Please check permissions.');
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
    
    let dataURL = canvas.toDataURL('image/jpeg', 0.9);
    
    // Resize if needed to keep file size manageable
    dataURL = await resizeImageIfNeeded(dataURL, 1024);
    
    onCapture(dataURL);
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setSelectedDeviceId(devices[nextIndex].deviceId);
    }
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
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Camera Analysis</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Position food items clearly in the camera view
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                <div className="text-center p-4">
                  <Camera className="w-12 h-12 text-destructive mx-auto mb-2" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              </div>
            ) : !isStreaming ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Camera Preview</p>
                  <Button 
                    onClick={startStream} 
                    className="mt-2"
                    data-testid="button-start-camera"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Camera
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

                {/* Camera Controls Overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <Button
                    onClick={captureImage}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg"
                    disabled={isAnalyzing}
                    data-testid="button-capture-image"
                  >
                    <Camera className="w-6 h-6" />
                  </Button>
                  {devices.length > 1 && (
                    <Button
                      onClick={switchCamera}
                      variant="secondary"
                      className="p-3 rounded-full shadow-lg"
                      data-testid="button-switch-camera"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </Button>
                  )}
                  <Button
                    onClick={stopStream}
                    variant="destructive"
                    className="p-3 rounded-full shadow-lg"
                    data-testid="button-stop-camera"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Camera Controls */}
          <div className="space-y-3">
            {devices.length > 0 && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Camera Device:</label>
                <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                  <SelectTrigger className="w-48" data-testid="select-camera-device">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices
                      .filter(device => device.deviceId && device.deviceId.trim() !== '')
                      .map((device, index) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${index + 1}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button
              onClick={() => isStreaming && captureImage()}
              disabled={!isStreaming || isAnalyzing}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              data-testid="button-analyze-camera"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Food with Camera"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Camera Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-2">Camera Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure good lighting on food items</li>
            <li>• Hold camera steady for clear capture</li>
            <li>• Position food items within the grid</li>
            <li>• Avoid shadows and reflections</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
