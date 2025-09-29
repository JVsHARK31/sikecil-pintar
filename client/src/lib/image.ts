import type { BoundingBox } from "@shared/schema";

export interface CanvasDrawInfo {
  scale: number;
  drawW: number;
  drawH: number;
  offsetX: number;
  offsetY: number;
}

export function calculateDrawInfo(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): CanvasDrawInfo {
  const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
  const drawW = imageWidth * scale;
  const drawH = imageHeight * scale;
  const offsetX = (canvasWidth - drawW) / 2;
  const offsetY = (canvasHeight - drawH) / 2;

  return { scale, drawW, drawH, offsetX, offsetY };
}

export function bboxToPixels(
  bbox: BoundingBox,
  drawInfo: CanvasDrawInfo
): { x: number; y: number; w: number; h: number } {
  return {
    x: drawInfo.offsetX + bbox.x * drawInfo.drawW,
    y: drawInfo.offsetY + bbox.y * drawInfo.drawH,
    w: bbox.w * drawInfo.drawW,
    h: bbox.h * drawInfo.drawH,
  };
}

export function fixImageOrientation(imageElement: HTMLImageElement): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    
    // For now, just draw the image as-is
    // In a production app, you'd read EXIF data and rotate accordingly
    ctx.drawImage(imageElement, 0, 0);
    
    resolve(canvas.toDataURL('image/jpeg', 0.9));
  });
}

export function resizeImageIfNeeded(dataURL: string, maxSize: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(dataURL); // Return original if canvas fails
          return;
        }
        
        let { width, height } = img;
        
        // Check if image has valid dimensions
        if (width === 0 || height === 0) {
          resolve(dataURL); // Return original if dimensions are invalid
          return;
        }
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with high compression
        let quality = 0.7;
        let resizedDataURL = canvas.toDataURL('image/jpeg', quality);
        
        // If still too large (>1MB as base64), compress further
        while (resizedDataURL.length > 1024 * 1024 && quality > 0.3) {
          quality -= 0.1;
          resizedDataURL = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(resizedDataURL);
      } catch (error) {
        resolve(dataURL); // Return original if resize fails
      }
    };
    
    img.onerror = () => {
      resolve(dataURL); // Return original if load fails
    };
    
    img.src = dataURL;
  });
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'hsl(122 39% 49%)'; // High confidence - green
  if (confidence >= 0.6) return 'hsl(36 100% 62%)'; // Medium confidence - orange
  return 'hsl(0 84% 60%)'; // Low confidence - red
}

export function getConfidenceClass(confidence: number): string {
  if (confidence >= 0.8) return 'confidence-high';
  if (confidence >= 0.6) return 'confidence-medium';
  return 'confidence-low';
}
