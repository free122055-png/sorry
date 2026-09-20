import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Check, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Circle,
  Square,
  Search,
  Lock,
  Unlock,
  Maximize2
} from 'lucide-react';

interface ImageCropModalProps {
  imageSrc: string;
  initialAspect?: number | null;
  mode?: 'background' | 'layer';
  onCropComplete: (croppedBase64: string, cropWidth: number, cropHeight: number) => void;
  onClose: () => void;
}

interface CropRect {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

const ASPECT_PRESETS = [
  { label: "1:1", ratio: 1 / 1 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "4:5", ratio: 4 / 5 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "1:4", ratio: 1 / 4 },
  { label: "7:3", ratio: 7 / 3 },
  { label: "4:6", ratio: 4 / 6 },
  { label: "6:8", ratio: 6 / 8 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "Free", ratio: null },
];

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  initialAspect = null,
  mode = 'background',
  onCropComplete,
  onClose,
}) => {
  const [selectedRatio, setSelectedRatio] = useState<number | null>(initialAspect);
  const [isCircleCrop, setIsCircleCrop] = useState(false);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270

  const [naturalWidth, setNaturalWidth] = useState(1080);
  const [naturalHeight, setNaturalHeight] = useState(1080);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Normalized crop rectangle: percentages (0-100)
  const [crop, setCrop] = useState<CropRect>({ x: 5, y: 5, width: 90, height: 90 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageDisplayRef = useRef<HTMLImageElement>(null);

  // Dragging states
  const isDraggingRef = useRef(false);
  const dragTypeRef = useRef<string | null>(null); // 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialCropRef = useRef<CropRect>({ x: 0, y: 0, width: 100, height: 100 });

  // Load natural image dimensions
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setNaturalWidth(img.naturalWidth || 1080);
      setNaturalHeight(img.naturalHeight || 1080);
      setImageLoaded(true);
      
      // Initialize crop box based on image aspect and default ratio
      const imgAspect = (img.naturalWidth || 1080) / (img.naturalHeight || 1080);
      applyAspectToCrop(selectedRatio, imgAspect);
    };
  }, [imageSrc]);

  // Adjust crop rectangle based on aspect ratio
  const applyAspectToCrop = useCallback((targetRatio: number | null, customImgAspect?: number) => {
    const isRotated90or270 = rotation % 180 !== 0;
    const currentW = isRotated90or270 ? naturalHeight : naturalWidth;
    const currentH = isRotated90or270 ? naturalWidth : naturalHeight;
    const imgAspect = customImgAspect || (currentW / currentH);

    if (targetRatio === null) {
      // Freeform crop: standard 90% centered box
      setCrop({ x: 5, y: 5, width: 90, height: 90 });
      return;
    }

    // Target ratio = width / height in real space
    // Let's compute normalized width % and height % on the displayed image
    let normW = 90;
    let normH = 90;

    // targetRatio = (normW * imgWidth) / (normH * imgHeight)
    // => normH = (normW * imgAspect) / targetRatio
    const calculatedNormH = (normW * imgAspect) / targetRatio;

    if (calculatedNormH <= 90) {
      normH = calculatedNormH;
    } else {
      normH = 90;
      normW = (normH * targetRatio) / imgAspect;
    }

    normW = Math.min(96, Math.max(15, normW));
    normH = Math.min(96, Math.max(15, normH));

    const normX = Math.max(0, (100 - normW) / 2);
    const normY = Math.max(0, (100 - normH) / 2);

    setCrop({
      x: normX,
      y: normY,
      width: normW,
      height: normH
    });
  }, [naturalWidth, naturalHeight, rotation]);

  const handleRatioChange = (ratio: number | null) => {
    setSelectedRatio(ratio);
    applyAspectToCrop(ratio);
  };

  // Rotation handler
  const handleRotate = (deg: number) => {
    const newRot = (rotation + deg + 360) % 360;
    setRotation(newRot);
    // Re-adjust aspect crop
    setTimeout(() => {
      applyAspectToCrop(selectedRatio);
    }, 50);
  };

  // Drag interaction handlers
  const handlePointerDown = (e: React.PointerEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragTypeRef.current = type;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialCropRef.current = { ...crop };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !imageDisplayRef.current) return;
    e.preventDefault();

    const rect = imageDisplayRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dxPercent = ((e.clientX - dragStartPos.current.x) / rect.width) * 100;
    const dyPercent = ((e.clientY - dragStartPos.current.y) / rect.height) * 100;

    const init = initialCropRef.current;
    let newCrop = { ...init };
    const type = dragTypeRef.current;

    const minSize = 10; // minimum 10%

    if (type === 'move') {
      newCrop.x = Math.max(0, Math.min(100 - init.width, init.x + dxPercent));
      newCrop.y = Math.max(0, Math.min(100 - init.height, init.y + dyPercent));
    } else {
      // Handle corner and edge resizes
      let left = init.x;
      let top = init.y;
      let right = init.x + init.width;
      let bottom = init.y + init.height;

      if (type?.includes('w')) {
        left = Math.max(0, Math.min(right - minSize, init.x + dxPercent));
      }
      if (type?.includes('e')) {
        right = Math.min(100, Math.max(left + minSize, init.x + init.width + dxPercent));
      }
      if (type?.includes('n')) {
        top = Math.max(0, Math.min(bottom - minSize, init.y + dyPercent));
      }
      if (type?.includes('s')) {
        bottom = Math.min(100, Math.max(top + minSize, init.y + init.height + dyPercent));
      }

      let w = right - left;
      let h = bottom - top;

      // If ratio is locked, preserve aspect ratio
      if (selectedRatio !== null) {
        const isRotated90or270 = rotation % 180 !== 0;
        const currentW = isRotated90or270 ? naturalHeight : naturalWidth;
        const currentH = isRotated90or270 ? naturalWidth : naturalHeight;
        const imgAspect = currentW / currentH;

        if (type === 'e' || type === 'w' || type === 'se' || type === 'sw') {
          h = (w * imgAspect) / selectedRatio;
          if (top + h > 100) {
            h = 100 - top;
            w = (h * selectedRatio) / imgAspect;
          }
        } else if (type === 'n' || type === 's' || type === 'ne' || type === 'nw') {
          w = (h * selectedRatio) / imgAspect;
          if (left + w > 100) {
            w = 100 - left;
            h = (w * imgAspect) / selectedRatio;
          }
        }
      }

      newCrop = {
        x: Math.max(0, Math.min(100 - minSize, left)),
        y: Math.max(0, Math.min(100 - minSize, top)),
        width: Math.max(minSize, Math.min(100 - left, w)),
        height: Math.max(minSize, Math.min(100 - top, h))
      };
    }

    setCrop(newCrop);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    dragTypeRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Perform Final Crop
  const handleApplyCrop = async () => {
    if (!imageLoaded) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;

      await new Promise<void>((resolve, reject) => {
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = reject;
        }
      });

      // 1. Create a full transformation canvas for rotation / flip
      const isRotated90or270 = rotation % 180 !== 0;
      const transWidth = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const transHeight = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      const transCanvas = document.createElement("canvas");
      transCanvas.width = transWidth;
      transCanvas.height = transHeight;
      const transCtx = transCanvas.getContext("2d");
      if (!transCtx) return;

      transCtx.save();
      transCtx.translate(transWidth / 2, transHeight / 2);
      transCtx.rotate((rotation * Math.PI) / 180);
      transCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      transCtx.drawImage(
        img,
        -img.naturalWidth / 2,
        -img.naturalHeight / 2,
        img.naturalWidth,
        img.naturalHeight
      );
      transCtx.restore();

      // 2. Crop from the transformed canvas
      const cropX = (crop.x / 100) * transWidth;
      const cropY = (crop.y / 100) * transHeight;
      const cropW = (crop.width / 100) * transWidth;
      const cropH = (crop.height / 100) * transHeight;

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = Math.max(1, Math.round(cropW));
      finalCanvas.height = Math.max(1, Math.round(cropH));
      const finalCtx = finalCanvas.getContext("2d");
      if (!finalCtx) return;

      if (isCircleCrop) {
        finalCtx.save();
        finalCtx.beginPath();
        finalCtx.ellipse(
          finalCanvas.width / 2,
          finalCanvas.height / 2,
          finalCanvas.width / 2,
          finalCanvas.height / 2,
          0,
          0,
          Math.PI * 2
        );
        finalCtx.clip();
      }

      finalCtx.drawImage(
        transCanvas,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        finalCanvas.width,
        finalCanvas.height
      );

      if (isCircleCrop) {
        finalCtx.restore();
      }

      const croppedBase64 = finalCanvas.toDataURL("image/png", 0.95);
      onCropComplete(croppedBase64, finalCanvas.width, finalCanvas.height);
    } catch (err) {
      console.error("Cropping failed:", err);
      // Fallback
      onCropComplete(imageSrc, naturalWidth, naturalHeight);
    }
  };

  // Estimate output dimensions
  const isRotated90or270 = rotation % 180 !== 0;
  const transWidth = isRotated90or270 ? naturalHeight : naturalWidth;
  const transHeight = isRotated90or270 ? naturalWidth : naturalHeight;
  const estimatedW = Math.round((crop.width / 100) * transWidth);
  const estimatedH = Math.round((crop.height / 100) * transHeight);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans select-none overflow-hidden text-white touch-none">
      {/* Top Header Bar */}
      <div className="px-4 py-2 bg-black border-b border-white/10 flex items-center justify-between shrink-0 select-none">
        <button 
          onClick={onClose} 
          className="p-2 text-white/70 hover:text-white rounded-full transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Search / Zoom Icon like PixelLab */}
        <div className="p-2 text-white/80">
          <Search className="w-5 h-5" />
        </div>

        {/* Resolution indicator */}
        <div className="text-[11px] font-mono text-white/60">
          {estimatedW}×{estimatedH}
        </div>
      </div>

      {/* Main Image Cropping Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 bg-[#121212] flex items-center justify-center p-4 relative overflow-hidden select-none"
      >
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {/* Base Image */}
          <img
            ref={imageDisplayRef}
            src={imageSrc}
            alt="To crop"
            draggable={false}
            style={{
              maxHeight: '62vh',
              maxWidth: '88vw',
              transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
              transition: 'transform 0.15s ease-out',
              display: 'block',
              objectFit: 'contain'
            }}
            className="pointer-events-none rounded shadow-2xl"
          />

          {/* Semi-transparent Dimmed Overlay Outside Crop Box */}
          {imageLoaded && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'rgba(0, 0, 0, 0.55)',
                clipPath: isCircleCrop 
                  ? `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)` // We use CSS cutout overlay
                  : undefined
              }}
            >
              {/* Cutout box */}
              <div 
                className="absolute"
                style={{
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                  borderRadius: isCircleCrop ? '50%' : '0px'
                }}
              />
            </div>
          )}

          {/* Interactive Bounding Crop Box */}
          {imageLoaded && (
            <div
              className={`absolute border-2 ${isCircleCrop ? 'rounded-full border-blue-400' : 'border-white'} touch-none cursor-move shadow-2xl`}
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
              onPointerDown={(e) => handlePointerDown(e, 'move')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* 3x3 Grid Lines */}
              {!isCircleCrop && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-white/30" />
                  <div className="border-r border-white/30" />
                  <div />
                </div>
              )}

              {/* Corner Handles - Round white circles like PixelLab */}
              {/* Top-Left */}
              <div
                className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border border-black/60 rounded-full cursor-nwse-resize z-20 shadow-md"
                onPointerDown={(e) => handlePointerDown(e, 'nw')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              {/* Top-Right */}
              <div
                className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border border-black/60 rounded-full cursor-nesw-resize z-20 shadow-md"
                onPointerDown={(e) => handlePointerDown(e, 'ne')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              {/* Bottom-Left */}
              <div
                className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border border-black/60 rounded-full cursor-nesw-resize z-20 shadow-md"
                onPointerDown={(e) => handlePointerDown(e, 'sw')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              {/* Bottom-Right */}
              <div
                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border border-black/60 rounded-full cursor-nwse-resize z-20 shadow-md"
                onPointerDown={(e) => handlePointerDown(e, 'se')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />

              {/* Edge Handles */}
              {!isCircleCrop && (
                <>
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-black/60 rounded-full cursor-ns-resize z-10 shadow"
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-black/60 rounded-full cursor-ns-resize z-10 shadow"
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                  <div
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-6 bg-white border border-black/60 rounded-full cursor-ew-resize z-10 shadow"
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                  <div
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-6 bg-white border border-black/60 rounded-full cursor-ew-resize z-10 shadow"
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aspect Ratio Presets Bar (Horizontal Scrollable like PixelLab) */}
      <div className="bg-[#111111] border-t border-white/10 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 select-none">
        {ASPECT_PRESETS.map((preset) => {
          const isActive = selectedRatio === preset.ratio && !isCircleCrop;
          return (
            <button
              key={preset.label}
              onClick={() => {
                setIsCircleCrop(false);
                handleRatioChange(preset.ratio);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow font-bold' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
        {/* Circular Aspect Crop Option */}
        <button
          onClick={() => {
            setIsCircleCrop(true);
            handleRatioChange(1);
          }}
          className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
            isCircleCrop 
              ? 'bg-blue-600 text-white shadow font-bold' 
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          <Circle className="w-3.5 h-3.5 fill-current" />
          <span>Circle</span>
        </button>
      </div>

      {/* Tool Actions Row (Flip, Rotate, Reset, Lock) */}
      <div className="bg-[#0a0a0a] px-3 py-2 border-t border-white/5 flex items-center justify-around shrink-0 select-none text-white/80">
        <button
          onClick={() => setFlipH(!flipH)}
          title="Flip Horizontal"
          className={`p-2 rounded-lg transition-colors ${flipH ? 'bg-blue-600/40 text-blue-400' : 'hover:bg-white/10'}`}
        >
          <FlipHorizontal className="w-5 h-5" />
        </button>

        <button
          onClick={() => setFlipV(!flipV)}
          title="Flip Vertical"
          className={`p-2 rounded-lg transition-colors ${flipV ? 'bg-blue-600/40 text-blue-400' : 'hover:bg-white/10'}`}
        >
          <FlipVertical className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleRotate(-90)}
          title="Rotate Left"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleRotate(90)}
          title="Rotate Right"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <RotateCw className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setCrop({ x: 0, y: 0, width: 100, height: 100 });
            setSelectedRatio(null);
            setIsCircleCrop(false);
          }}
          title="Reset Crop Bounds"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            if (selectedRatio !== null) {
              setSelectedRatio(null);
            } else {
              setSelectedRatio(1);
              applyAspectToCrop(1);
            }
          }}
          title={selectedRatio !== null ? "Ratio Locked" : "Free Crop"}
          className={`p-2 rounded-lg transition-colors ${selectedRatio !== null ? 'text-blue-400' : 'text-white/60'}`}
        >
          {selectedRatio !== null ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setIsCircleCrop(!isCircleCrop)}
          title="Circle Crop"
          className={`p-2 rounded-lg transition-colors ${isCircleCrop ? 'text-blue-400' : 'text-white/60'}`}
        >
          <Circle className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Bar: Cancel (✕) & Confirm (✓) like PixelLab */}
      <div className="bg-black px-6 py-2.5 border-t border-white/10 flex items-center justify-between shrink-0 select-none">
        <button
          onClick={onClose}
          className="p-2 text-white/80 hover:text-white transition-colors active:scale-90 flex items-center gap-1.5"
          title="Cancel"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={handleApplyCrop}
          className="p-2 text-white hover:text-blue-400 transition-colors active:scale-90 flex items-center gap-1.5"
          title="Confirm Crop"
        >
          <Check className="w-7 h-7 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
