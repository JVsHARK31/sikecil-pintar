import { useEffect, useRef } from "react";
import type { FoodItem, ImageMeta } from "@shared/schema";
import { calculateDrawInfo, bboxToPixels, getConfidenceColor } from "@/lib/image";

interface OverlayCanvasProps {
  imageUrl: string;
  foodItems: FoodItem[];
  imageMeta: ImageMeta;
  className?: string;
}

export function OverlayCanvas({ imageUrl, foodItems, imageMeta, className }: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlays = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image maintaining aspect ratio
      const drawInfo = calculateDrawInfo(
        imageMeta.width, 
        imageMeta.height, 
        canvas.width, 
        canvas.height
      );

      ctx.drawImage(
        image,
        drawInfo.offsetX,
        drawInfo.offsetY,
        drawInfo.drawW,
        drawInfo.drawH
      );

      // Draw overlays for each food item
      foodItems.forEach((item, index) => {
        const bbox = bboxToPixels(item.bbox_norm, drawInfo);
        const color = getConfidenceColor(item.confidence);

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);

        // Draw semi-transparent overlay
        ctx.fillStyle = color.replace(')', ' / 0.1)').replace('hsl(', 'hsla(');
        ctx.fillRect(bbox.x, bbox.y, bbox.w, bbox.h);

        // Draw label background
        const labelText = `${item.label} (${(item.confidence * 100).toFixed(0)}%)`;
        const labelPadding = 8;
        const labelHeight = 24;
        
        ctx.font = '12px Inter, sans-serif';
        const textMetrics = ctx.measureText(labelText);
        const labelWidth = textMetrics.width + labelPadding * 2;

        // Position label above bounding box, or inside if not enough space
        const labelY = bbox.y > labelHeight + 5 ? bbox.y - 5 : bbox.y + labelHeight;
        const labelX = Math.max(0, Math.min(bbox.x, canvas.width - labelWidth));

        // Draw label background
        ctx.fillStyle = color;
        ctx.fillRect(labelX, labelY - labelHeight, labelWidth, labelHeight);

        // Draw label text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          labelText,
          labelX + labelPadding,
          labelY - labelHeight / 2
        );

        // Draw weight estimate
        const weightText = `${item.serving_est_g}g`;
        const weightY = labelY - labelHeight + 16;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(weightText, labelX + labelPadding, weightY);
      });
    };

    // Load image and draw overlays
    image.onload = drawOverlays;
    if (image.complete) drawOverlays();

    // Redraw on canvas resize
    const resizeObserver = new ResizeObserver(drawOverlays);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [imageUrl, foodItems, imageMeta]);

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Food analysis"
        className="hidden"
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        data-testid="canvas-overlay"
      />
    </div>
  );
}
