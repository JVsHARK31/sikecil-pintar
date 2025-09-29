import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon } from "lucide-react";
import { resizeImageIfNeeded } from "@/lib/image";

interface UploadPanelProps {
  onUpload: (dataURL: string) => void;
  isAnalyzing: boolean;
}

export function UploadPanel({ onUpload, isAnalyzing }: UploadPanelProps) {
  const [previewImage, setPreviewImage] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('File size must be less than 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        let dataURL = e.target.result as string;
        
        // Resize if needed
        dataURL = await resizeImageIfNeeded(dataURL, 1024);
        
        setPreviewImage(dataURL);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const analyzeImage = () => {
    if (previewImage) {
      onUpload(previewImage);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Analysis</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a clear image of food items for detailed analysis
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Upload Zone */}
          <div
            className={`upload-zone p-8 text-center cursor-pointer border-2 border-dashed rounded-lg transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary hover:bg-primary/5'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={triggerFileInput}
            data-testid="upload-zone"
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Drop your food image here
            </h3>
            <p className="text-muted-foreground mb-4">or click to browse files</p>
            <Button 
              type="button" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="button-choose-file"
            >
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Supports JPG, PNG, WebP up to 8MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            data-testid="input-file-upload"
          />

          {/* Upload Controls */}
          <Button
            onClick={analyzeImage}
            disabled={!previewImage || isAnalyzing}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            data-testid="button-analyze-upload"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Uploaded Image"}
          </Button>
        </CardContent>
      </Card>

      {/* Image Preview */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Image Preview</h3>
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Upload preview" 
                className="w-full h-full object-contain"
                data-testid="img-preview"
              />
            ) : (
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No image selected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-green-900 mb-2">Upload Tips</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Use high-resolution images for better accuracy</li>
            <li>• Ensure all food items are visible</li>
            <li>• Avoid cluttered backgrounds</li>
            <li>• Good lighting improves detection</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
