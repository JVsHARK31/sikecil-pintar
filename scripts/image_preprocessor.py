#!/usr/bin/env python3
"""
Image Preprocessor
Preprocess food images before sending to analysis API
Includes resizing, format conversion, and quality optimization
"""

import sys
import base64
from pathlib import Path
from typing import Tuple, Optional

try:
    from PIL import Image
    import io
except ImportError:
    print("Error: This script requires Pillow library")
    print("Install with: pip install Pillow")
    sys.exit(1)


class ImagePreprocessor:
    """Preprocess images for food nutrition analysis"""
    
    def __init__(self, max_size: Tuple[int, int] = (1920, 1920), 
                 quality: int = 85, format: str = 'JPEG'):
        self.max_size = max_size
        self.quality = quality
        self.format = format
    
    def load_image(self, image_path: str) -> Image.Image:
        """Load image from file"""
        try:
            img = Image.open(image_path)
            print(f"✓ Loaded image: {image_path}")
            print(f"  Original size: {img.size[0]}x{img.size[1]}")
            print(f"  Original format: {img.format}")
            print(f"  Original mode: {img.mode}")
            return img
        except Exception as e:
            print(f"✗ Error loading image: {e}")
            sys.exit(1)
    
    def resize_image(self, img: Image.Image) -> Image.Image:
        """Resize image while maintaining aspect ratio"""
        if img.size[0] <= self.max_size[0] and img.size[1] <= self.max_size[1]:
            print("  No resizing needed")
            return img
        
        img.thumbnail(self.max_size, Image.Resampling.LANCZOS)
        print(f"  Resized to: {img.size[0]}x{img.size[1]}")
        return img
    
    def convert_mode(self, img: Image.Image) -> Image.Image:
        """Convert image mode if necessary"""
        if img.mode == 'RGBA' and self.format == 'JPEG':
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if len(img.split()) > 3 else None)
            print("  Converted RGBA to RGB (white background)")
            return background
        elif img.mode != 'RGB' and self.format == 'JPEG':
            img = img.convert('RGB')
            print(f"  Converted mode to RGB")
            return img
        return img
    
    def optimize_image(self, img: Image.Image) -> bytes:
        """Optimize image and return bytes"""
        buffer = io.BytesIO()
        img.save(buffer, format=self.format, quality=self.quality, optimize=True)
        img_bytes = buffer.getvalue()
        print(f"  Optimized size: {len(img_bytes) / 1024:.2f} KB")
        return img_bytes
    
    def to_base64(self, img_bytes: bytes) -> str:
        """Convert image bytes to base64 string"""
        b64_string = base64.b64encode(img_bytes).decode('utf-8')
        return f"data:image/jpeg;base64,{b64_string}"
    
    def process(self, image_path: str) -> Tuple[bytes, str]:
        """Process image: resize, optimize, and convert to base64"""
        print("\nProcessing image...")
        
        # Load image
        img = self.load_image(image_path)
        
        # Resize
        img = self.resize_image(img)
        
        # Convert mode
        img = self.convert_mode(img)
        
        # Optimize
        img_bytes = self.optimize_image(img)
        
        # Convert to base64
        b64_string = self.to_base64(img_bytes)
        
        print(f"✓ Processing complete")
        print(f"  Final size: {len(img_bytes) / 1024:.2f} KB")
        print(f"  Base64 length: {len(b64_string)} characters")
        
        return img_bytes, b64_string
    
    def save_processed(self, img_bytes: bytes, output_path: str):
        """Save processed image to file"""
        try:
            with open(output_path, 'wb') as f:
                f.write(img_bytes)
            print(f"✓ Saved processed image to: {output_path}")
        except Exception as e:
            print(f"✗ Error saving image: {e}")
    
    def save_base64(self, b64_string: str, output_path: str):
        """Save base64 string to text file"""
        try:
            with open(output_path, 'w') as f:
                f.write(b64_string)
            print(f"✓ Saved base64 to: {output_path}")
        except Exception as e:
            print(f"✗ Error saving base64: {e}")


def batch_process(input_dir: str, output_dir: str, max_size: Tuple[int, int] = (1920, 1920)):
    """Batch process all images in a directory"""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    if not input_path.exists():
        print(f"✗ Input directory not found: {input_dir}")
        sys.exit(1)
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Supported image formats
    extensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif']
    image_files = []
    
    for ext in extensions:
        image_files.extend(input_path.glob(f"*{ext}"))
        image_files.extend(input_path.glob(f"*{ext.upper()}"))
    
    if not image_files:
        print(f"No image files found in {input_dir}")
        return
    
    print(f"\nFound {len(image_files)} images to process")
    print("=" * 60)
    
    preprocessor = ImagePreprocessor(max_size=max_size)
    
    for i, img_file in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}] Processing: {img_file.name}")
        
        output_file = output_path / f"{img_file.stem}_processed.jpg"
        
        try:
            img_bytes, _ = preprocessor.process(str(img_file))
            preprocessor.save_processed(img_bytes, str(output_file))
        except Exception as e:
            print(f"✗ Error processing {img_file.name}: {e}")
            continue
    
    print("\n" + "=" * 60)
    print(f"✓ Batch processing complete!")
    print(f"  Processed: {len(image_files)} images")
    print(f"  Output directory: {output_dir}")


def print_help():
    """Print help message"""
    print("""
Image Preprocessor - Optimize food images for nutrition analysis

Usage:
  python image_preprocessor.py <command> [options]

Commands:
  process <input> [output]
      Process a single image
      Example: python image_preprocessor.py process food.jpg processed.jpg
  
  base64 <input> [output]
      Convert image to base64 string
      Example: python image_preprocessor.py base64 food.jpg food_b64.txt
  
  batch <input_dir> <output_dir>
      Batch process all images in a directory
      Example: python image_preprocessor.py batch ./images ./processed
  
  help
      Show this help message

Options:
  --max-size WIDTHxHEIGHT    Maximum image dimensions (default: 1920x1920)
  --quality QUALITY          JPEG quality 0-100 (default: 85)

Examples:
  python image_preprocessor.py process photo.jpg optimized.jpg
  python image_preprocessor.py base64 photo.jpg --quality 90
  python image_preprocessor.py batch ./raw_images ./optimized_images
    """)


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print_help()
        return
    
    command = sys.argv[1].lower()
    
    if command == 'help':
        print_help()
        return
    
    # Default settings
    max_size = (1920, 1920)
    quality = 85
    
    # Parse options
    args = sys.argv[2:]
    filtered_args = []
    i = 0
    while i < len(args):
        if args[i] == '--max-size' and i + 1 < len(args):
            try:
                w, h = map(int, args[i + 1].split('x'))
                max_size = (w, h)
                i += 2
                continue
            except:
                print("Invalid max-size format. Use WIDTHxHEIGHT")
                sys.exit(1)
        elif args[i] == '--quality' and i + 1 < len(args):
            try:
                quality = int(args[i + 1])
                i += 2
                continue
            except:
                print("Invalid quality value")
                sys.exit(1)
        filtered_args.append(args[i])
        i += 1
    
    preprocessor = ImagePreprocessor(max_size=max_size, quality=quality)
    
    if command == 'process':
        if len(filtered_args) < 1:
            print("Usage: python image_preprocessor.py process <input> [output]")
            return
        
        input_file = filtered_args[0]
        output_file = filtered_args[1] if len(filtered_args) > 1 else f"{Path(input_file).stem}_processed.jpg"
        
        img_bytes, _ = preprocessor.process(input_file)
        preprocessor.save_processed(img_bytes, output_file)
    
    elif command == 'base64':
        if len(filtered_args) < 1:
            print("Usage: python image_preprocessor.py base64 <input> [output]")
            return
        
        input_file = filtered_args[0]
        output_file = filtered_args[1] if len(filtered_args) > 1 else f"{Path(input_file).stem}_base64.txt"
        
        _, b64_string = preprocessor.process(input_file)
        preprocessor.save_base64(b64_string, output_file)
    
    elif command == 'batch':
        if len(filtered_args) < 2:
            print("Usage: python image_preprocessor.py batch <input_dir> <output_dir>")
            return
        
        input_dir = filtered_args[0]
        output_dir = filtered_args[1]
        
        batch_process(input_dir, output_dir, max_size)
    
    else:
        print(f"Unknown command: {command}")
        print("Run 'python image_preprocessor.py help' for usage information")


if __name__ == "__main__":
    main()
