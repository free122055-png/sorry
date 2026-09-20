import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Plus, Pipette, Edit2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default Solid Colors
export const DEFAULT_SOLID_COLORS = [
  '#000000', '#ffffff', '#0f766e', '#15803d', '#84cc16', '#eab308',
  '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#f43f5e', '#ec4899',
  '#d946ef', '#a855f7', '#7c3aed', '#6366f1', '#3b82f6', '#0ea5e9',
  '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#854d0e', '#78350f',
  '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'
];

// Default Multi-stop Gradients
export const DEFAULT_GRADIENTS = [
  'linear-gradient(to bottom, #000000, #ffffff)',
  'linear-gradient(180deg, #000000, #333333)',
  'linear-gradient(135deg, #020617, #0891b2)',
  'linear-gradient(135deg, #0f172a, #7e22ce)',
  'linear-gradient(135deg, #dc2626, #eab308)',
  'linear-gradient(135deg, #7c3aed, #f43f5e)',
  'linear-gradient(135deg, #065f46, #34d399)',
  'linear-gradient(135deg, #1e40af, #38bdf8)',
  'linear-gradient(135deg, #4c1d95, #ec4899)',
  'linear-gradient(135deg, #c2410c, #fde047)',
  'linear-gradient(135deg, #18181b, #a1a1aa)',
  'linear-gradient(135deg, #fed7aa, #f472b6)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #111827, #374151)',
  'linear-gradient(135deg, #831843, #be185d)',
  'radial-gradient(circle, #3b82f6 0%, #050510 100%)',
  'radial-gradient(circle, #f59e0b 0%, #1c1917 100%)',
  'radial-gradient(circle, #ec4899 0%, #311025 100%)',
  'linear-gradient(to right, #000428, #004e92)',
  'linear-gradient(to right, #11998e, #38ef7d)'
];

// Helper to convert HSV to Hex
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// -------------------------------------------------------------
// PixelLab Color Wheel Modal Component (Exact Android PixelLab UI)
// -------------------------------------------------------------
interface PixelColorWheelModalProps {
  isOpen: boolean;
  initialColor: string;
  onClose: () => void;
  onApply: (color: string) => void;
}

export const PixelColorWheelModal: React.FC<PixelColorWheelModalProps> = ({
  isOpen,
  initialColor,
  onClose,
  onApply
}) => {
  const [hue, setHue] = useState(0.5); // 0 to 1
  const [sat, setSat] = useState(0.8); // 0 to 1
  const [val, setVal] = useState(1); // 0 to 1 (brightness)
  const [alpha, setAlpha] = useState(1); // 0 to 1
  const [hexInput, setHexInput] = useState('#3B82F6');
  const [isEditingHex, setIsEditingHex] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);

  // Initialize from initialColor
  useEffect(() => {
    if (initialColor && initialColor.startsWith('#')) {
      try {
        const [r, g, b] = hexToRgb(initialColor);
        setHexInput(initialColor.toUpperCase());
        // Simple RGB to HSV
        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const d = max - min;
        let h = 0;
        const s = max === 0 ? 0 : d / max;
        const v = max;
        if (max !== min) {
          switch (max) {
            case r / 255: h = (g / 255 - b / 255) / d + (g < b ? 6 : 0); break;
            case g / 255: h = (b / 255 - r / 255) / d + 2; break;
            case b / 255: h = (r / 255 - g / 255) / d + 4; break;
          }
          h /= 6;
        }
        setHue(h);
        setSat(s);
        setVal(v);
      } catch (e) {
        // fallback
      }
    }
  }, [initialColor, isOpen]);

  // Compute current color
  const [r, g, b] = hsvToRgb(hue, sat, val);
  const currentColorHex = rgbToHex(r, g, b);

  // Draw 360-degree HSV Color Wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 260;
    canvas.width = size;
    canvas.height = size;
    const radius = size / 2;
    const cx = radius;
    const cy = radius;

    const image = ctx.createImageData(size, size);
    const data = image.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const index = (y * size + x) * 4;

        if (dist <= radius) {
          let angle = Math.atan2(dy, dx) + Math.PI; // 0 to 2*PI
          const h = angle / (2 * Math.PI);
          const s = Math.min(1, dist / radius);
          const [cr, cg, cb] = hsvToRgb(h, s, 1);

          data[index] = cr;
          data[index + 1] = cg;
          data[index + 2] = cb;
          data[index + 3] = 255;
        } else {
          data[index + 3] = 0; // Transparent outside wheel
        }
      }
    }
    ctx.putImageData(image, 0, 0);
  }, []);

  // Handle Wheel Interaction
  const handleWheelPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wheelContainerRef.current) return;
    const rect = wheelContainerRef.current.getBoundingClientRect();
    const radius = rect.width / 2;
    const cx = rect.left + radius;
    const cy = rect.top + radius;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let angle = Math.atan2(dy, dx) + Math.PI; // 0 to 2*PI
    const newHue = angle / (2 * Math.PI);
    const newSat = Math.min(1, dist / radius);

    setHue(newHue);
    setSat(newSat);
    const [nr, ng, nb] = hsvToRgb(newHue, newSat, val);
    setHexInput(rgbToHex(nr, ng, nb));
  };

  // Eyedropper tool support (EyeDropper API)
  const handleEyedropper = async () => {
    if ((window as any).EyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          setHexInput(result.sRGBHex.toUpperCase());
          const [er, eg, eb] = hexToRgb(result.sRGBHex);
          const max = Math.max(er, eg, eb) / 255;
          const min = Math.min(er, eg, eb) / 255;
          const d = max - min;
          let h = 0;
          if (max !== min) {
            switch (max) {
              case er / 255: h = (eg / 255 - eb / 255) / d + (eg < eb ? 6 : 0); break;
              case eg / 255: h = (eb / 255 - er / 255) / d + 2; break;
              case eb / 255: h = (er / 255 - eg / 255) / d + 4; break;
            }
            h /= 6;
          }
          setHue(h);
          setSat(max === 0 ? 0 : d / max);
          setVal(max);
        }
      } catch (err) {
        // user cancelled eyedropper
      }
    }
  };

  // Indicator position on the color wheel
  const wheelRadius = 110;
  const indicatorAngle = hue * 2 * Math.PI - Math.PI;
  const indicatorDist = sat * wheelRadius;
  const indicatorX = wheelRadius + Math.cos(indicatorAngle) * indicatorDist;
  const indicatorY = wheelRadius + Math.sin(indicatorAngle) * indicatorDist;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-[#12121c] border border-white/20 rounded-[28px] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Top Big Color Swatch Circle Preview */}
          <div className="pt-5 pb-2 flex flex-col items-center justify-center bg-[#0d0d14]">
            <div 
              className="w-16 h-16 rounded-full border-4 border-white/30 shadow-xl transition-all"
              style={{ backgroundColor: currentColorHex, opacity: alpha }}
            />
          </div>

          {/* Top Values & Pipette Bar */}
          <div className="px-5 py-2.5 flex items-center justify-between border-y border-white/10 bg-[#161622]">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-black text-white tracking-wider">
                {currentColorHex}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                ({r}, {g}, {b})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEyedropper}
                title="Eyedropper"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
              >
                <Pipette className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingHex(!isEditingHex)}
                title="Edit Hex"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Manual Hex Input Drawer */}
          {isEditingHex && (
            <div className="px-5 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  if (/^#([0-9A-F]{3}){1,2}$/i.test(e.target.value)) {
                    const [nr, ng, nb] = hexToRgb(e.target.value);
                    const max = Math.max(nr, ng, nb) / 255;
                    const min = Math.min(nr, ng, nb) / 255;
                    const d = max - min;
                    let h = 0;
                    if (max !== min) {
                      switch (max) {
                        case nr / 255: h = (ng / 255 - nb / 255) / d + (ng < nb ? 6 : 0); break;
                        case ng / 255: h = (nb / 255 - nr / 255) / d + 2; break;
                        case nb / 255: h = (nr / 255 - ng / 255) / d + 4; break;
                      }
                      h /= 6;
                    }
                    setHue(h);
                    setSat(max === 0 ? 0 : d / max);
                    setVal(max);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-white font-mono text-xs uppercase"
              />
              <button
                onClick={() => setIsEditingHex(false)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
              >
                Set
              </button>
            </div>
          )}

          {/* Color Wheel & Sliders */}
          <div className="p-5 flex flex-col items-center gap-4 bg-[#0d0d14]">
            {/* Circular Color Disc Wheel */}
            <div 
              ref={wheelContainerRef}
              onPointerDown={handleWheelPointer}
              onPointerMove={(e) => {
                if (e.buttons > 0) handleWheelPointer(e);
              }}
              className="relative w-[220px] h-[220px] rounded-full cursor-crosshair touch-none select-none shadow-2xl flex items-center justify-center overflow-hidden border-2 border-white/20"
            >
              <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
              
              {/* Draggable Circle Selector Ring */}
              <div 
                className="absolute w-6 h-6 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.8)] pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${indicatorX}px`,
                  top: `${indicatorY}px`,
                  backgroundColor: currentColorHex
                }}
              />
            </div>

            {/* Brightness / Value Slider */}
            <div className="w-full flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Brightness</span>
                <span>{Math.round(val * 100)}%</span>
              </div>
              <div className="relative h-6 w-full rounded-full overflow-hidden border border-white/20">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, #000000, ${rgbToHex(...hsvToRgb(hue, sat, 1))}, #ffffff)`
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={val}
                  onChange={(e) => setVal(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-0 bottom-0 w-4 rounded-full border-2 border-white bg-black/40 pointer-events-none shadow-md -translate-x-1/2"
                  style={{ left: `${val * 100}%` }}
                />
              </div>
            </div>

            {/* Opacity / Alpha Slider */}
            <div className="w-full flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Opacity</span>
                <span>{Math.round(alpha * 100)}%</span>
              </div>
              <div className="relative h-6 w-full rounded-full overflow-hidden border border-white/20 bg-[linear-gradient(45deg,#222_25%,transparent_25%),linear-gradient(-45deg,#222_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#222_75%),linear-gradient(-45deg,transparent_75%,#222_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0]">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, transparent, ${currentColorHex})`
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={alpha}
                  onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-0 bottom-0 w-4 rounded-full border-2 border-white bg-black/40 pointer-events-none shadow-md -translate-x-1/2"
                  style={{ left: `${alpha * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer CANCEL & OK Buttons */}
          <div className="p-4 border-t border-white/10 bg-[#161622] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white uppercase tracking-wider transition-colors active:scale-95"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(currentColorHex);
                onClose();
              }}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              OK
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// -------------------------------------------------------------
// PixelLab Inline Bottom Color Bar Component (Exact Video UI)
// -------------------------------------------------------------
interface PixelInlineColorBarProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  customColors?: string[];
  onAddCustomColor?: (color: string) => void;
}

export const PixelInlineColorBar: React.FC<PixelInlineColorBarProps> = ({
  currentColor,
  onColorChange,
  onConfirm,
  onCancel,
  customColors = [],
  onAddCustomColor
}) => {
  const [colorMode, setColorMode] = useState<'color' | 'gradient'>('color');
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  const solidList = [...DEFAULT_SOLID_COLORS, ...customColors];
  const gradientList = DEFAULT_GRADIENTS;

  return (
    <div className="flex items-center justify-between w-full h-full select-none">
      {/* Left / Center: Pill toggle & Horizontal Color Swatches */}
      <div className="flex flex-col gap-1.5 flex-1 overflow-hidden pr-3">
        {/* Toggle Pills: [ color ] [ gradient ] */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setColorMode('color')}
            className={`px-3 py-0.5 rounded-[4px] text-[10.5px] font-bold transition-all ${
              colorMode === 'color'
                ? 'bg-[#d81b60] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            color
          </button>
          <button
            type="button"
            onClick={() => setColorMode('gradient')}
            className={`px-3 py-0.5 rounded-[4px] text-[10.5px] font-bold transition-all ${
              colorMode === 'gradient'
                ? 'bg-[#d81b60] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            gradient
          </button>
        </div>

        {/* Horizontal Swatches Row */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth">
          {/* Swatches according to mode */}
          {colorMode === 'color' ? (
            <>
              {solidList.map((col, idx) => {
                const isSelected = currentColor.toLowerCase() === col.toLowerCase();
                return (
                  <button
                    key={`solid-${idx}`}
                    type="button"
                    onClick={() => onColorChange(col)}
                    className={`flex-shrink-0 w-8 h-8 rounded-full transition-transform active:scale-90 flex items-center justify-center shadow-md relative ${
                      isSelected ? 'ring-2 ring-white scale-110' : 'hover:scale-105 border border-white/20'
                    }`}
                    style={{ backgroundColor: col }}
                  >
                    {col === '#ffffff' && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {gradientList.map((grad, idx) => {
                const isSelected = currentColor === grad;
                return (
                  <button
                    key={`grad-${idx}`}
                    type="button"
                    onClick={() => onColorChange(grad)}
                    className={`flex-shrink-0 w-8 h-8 rounded-full transition-transform active:scale-90 flex items-center justify-center shadow-md relative ${
                      isSelected ? 'ring-2 ring-white scale-110' : 'hover:scale-105 border border-white/20'
                    }`}
                    style={{ background: grad }}
                  />
                );
              })}
            </>
          )}

          {/* Plus (+) Button for Custom Color Wheel */}
          <button
            type="button"
            onClick={() => setIsWheelOpen(true)}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Actions: Confirm (✓) and Cancel (✕) */}
      <div className="flex flex-col items-center justify-center gap-2 border-l border-white/10 pl-3 shrink-0">
        <button
          type="button"
          onClick={onConfirm}
          className="w-8 h-8 rounded-lg bg-[#1976d2] hover:bg-[#1565c0] text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
          title="Confirm"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* PixelLab Color Wheel Modal */}
      <PixelColorWheelModal
        isOpen={isWheelOpen}
        initialColor={currentColor}
        onClose={() => setIsWheelOpen(false)}
        onApply={(newCol) => {
          onColorChange(newCol);
          if (onAddCustomColor) {
            onAddCustomColor(newCol);
          }
        }}
      />
    </div>
  );
};
