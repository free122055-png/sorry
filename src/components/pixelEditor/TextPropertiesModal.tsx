import React, { useState } from 'react';
import { 
  X, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Sparkles, Sliders, Palette,
  Sun, Eye, Layers, Move, ChevronRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TemplateElement } from '../admin/TemplateManagement';
import { COLOR_PALETTE } from '../../data/pixelEditorData';

export type TextToolType = 
  | 'color' 
  | 'size' 
  | 'style' 
  | 'align' 
  | 'spacing' 
  | 'stroke' 
  | 'shadow' 
  | 'opacity' 
  | 'rotate' 
  | 'background' 
  | 'position'
  | 'relative'
  | '3d';

interface TextPropertiesModalProps {
  tool: TextToolType | null;
  onClose: () => void;
  activeLayer: TemplateElement | null;
  onUpdateLayer: (updates: Partial<TemplateElement>) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

export const TextPropertiesModal: React.FC<TextPropertiesModalProps> = ({
  tool,
  onClose,
  activeLayer,
  onUpdateLayer,
  canvasWidth = 1000,
  canvasHeight = 1000
}) => {
  if (!tool || !activeLayer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[105] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/20 pointer-events-auto" 
        />
        
        <motion.div 
          initial={{ y: 80, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: 80, opacity: 0 }} 
          className="bg-[#141414] w-full max-w-md rounded-t-[24px] sm:rounded-[24px] p-5 border-t sm:border border-white/15 shadow-[0_-12px_40px_rgba(0,0,0,0.85)] relative z-10 pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">
              {tool === 'color' && 'Text Color'}
              {tool === 'size' && 'Text Size (ফন্ট সাইজ)'}
              {tool === 'style' && 'Text Style (B / I / U)'}
              {tool === 'align' && 'Text Alignment (অ্যালাইনমেন্ট)'}
              {tool === 'spacing' && 'Spacing (লেটার ও লাইন স্পেসিং)'}
              {tool === 'stroke' && 'Stroke (স্ট্রোক/বর্ডার)'}
              {tool === 'shadow' && 'Shadow (শ্যাডো/ছায়া)'}
              {tool === 'opacity' && 'Opacity (স্বচ্ছতা)'}
              {tool === 'rotate' && 'Rotate (ঘূর্ণন)'}
              {tool === 'background' && 'Text Background (ব্যাকগ্রাউন্ড)'}
              {tool === 'position' && 'Position (পজিশন)'}
              {tool === 'relative' && 'Relative Alignment'}
              {tool === '3d' && '3D Style & Perspective'}
            </h3>
            <button onClick={onClose} className="p-1 rounded-full text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* COLOR TOOL */}
          {tool === 'color' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={activeLayer.color || '#000000'} 
                  onChange={(e) => onUpdateLayer({ color: e.target.value })} 
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-white/20"
                />
                <input 
                  type="text"
                  value={activeLayer.color || '#000000'}
                  onChange={(e) => onUpdateLayer({ color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                />
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-white/40 mb-2">Preset Colors</div>
                <div className="grid grid-cols-8 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateLayer({ color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-transform active:scale-95 ${
                        activeLayer.color === c ? 'border-blue-400 ring-2 ring-blue-500/50' : 'border-white/10'
                      }`}
                    >
                      {activeLayer.color === c && (
                        <Check className={`w-4 h-4 ${c === '#ffffff' || c === '#cbd5e1' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SIZE TOOL */}
          {tool === 'size' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-white/70 font-semibold">
                <span>Font Size</span>
                <span className="text-blue-400 font-bold">{activeLayer.fontSize || 50}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="250"
                value={activeLayer.fontSize || 50}
                onChange={(e) => onUpdateLayer({ fontSize: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateLayer({ fontSize: Math.max(12, (activeLayer.fontSize || 50) - 5) })}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  -5
                </button>
                <button
                  onClick={() => onUpdateLayer({ fontSize: Math.max(12, (activeLayer.fontSize || 50) - 1) })}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  -1
                </button>
                <button
                  onClick={() => onUpdateLayer({ fontSize: (activeLayer.fontSize || 50) + 1 })}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  +1
                </button>
                <button
                  onClick={() => onUpdateLayer({ fontSize: (activeLayer.fontSize || 50) + 5 })}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  +5
                </button>
              </div>
            </div>
          )}

          {/* STYLE (B / I / U) */}
          {tool === 'style' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    const isBold = activeLayer.fontWeight === 'bold' || activeLayer.fontWeight === 700;
                    onUpdateLayer({ fontWeight: isBold ? 'normal' : 'bold' });
                  }}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    activeLayer.fontWeight === 'bold' || activeLayer.fontWeight === 700
                      ? 'bg-blue-600/30 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Bold className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Bold</span>
                </button>

                <button
                  onClick={() => {
                    const isItalic = activeLayer.fontStyle === 'italic';
                    onUpdateLayer({ fontStyle: isItalic ? 'normal' : 'italic' });
                  }}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    activeLayer.fontStyle === 'italic'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Italic className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Italic</span>
                </button>

                <button
                  onClick={() => {
                    const isUnderline = activeLayer.textDecoration === 'underline';
                    onUpdateLayer({ textDecoration: isUnderline ? 'none' : 'underline' });
                  }}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    activeLayer.textDecoration === 'underline'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Underline className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Underline</span>
                </button>
              </div>
            </div>
          )}

          {/* ALIGN */}
          {tool === 'align' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'center', label: 'Center', icon: AlignCenter },
                  { id: 'right', label: 'Right', icon: AlignRight },
                  { id: 'justify', label: 'Justify', icon: AlignJustify }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = (activeLayer.textAlign || 'center') === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onUpdateLayer({ textAlign: item.id as any })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        isActive 
                          ? 'bg-blue-600/30 border-blue-500 text-blue-400' 
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[9px] font-bold uppercase">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SPACING */}
          {tool === 'spacing' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs text-white/70 font-semibold mb-1.5">
                  <span>Letter Spacing (অক্ষরের দূরত্ব)</span>
                  <span className="text-blue-400 font-bold">{activeLayer.letterSpacing || 0}px</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="40"
                  value={activeLayer.letterSpacing || 0}
                  onChange={(e) => onUpdateLayer({ letterSpacing: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-white/70 font-semibold mb-1.5">
                  <span>Line Height (লাইনের দূরত্ব)</span>
                  <span className="text-blue-400 font-bold">{activeLayer.lineHeight || 1.2}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="3"
                  step="0.1"
                  value={activeLayer.lineHeight || 1.2}
                  onChange={(e) => onUpdateLayer({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          )}

          {/* STROKE */}
          {tool === 'stroke' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80">Stroke Width</span>
                <span className="text-blue-400 text-xs font-bold">{activeLayer.strokeWidth || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={activeLayer.strokeWidth || 0}
                onChange={(e) => onUpdateLayer({ strokeWidth: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-white/40">Stroke Color</span>
                <div className="grid grid-cols-8 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateLayer({ strokeColor: c, strokeWidth: activeLayer.strokeWidth || 2 })}
                      style={{ backgroundColor: c }}
                      className={`w-8 h-8 rounded-lg border transition-transform active:scale-95 ${
                        activeLayer.strokeColor === c ? 'border-blue-400 ring-2 ring-blue-500/50' : 'border-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SHADOW */}
          {tool === 'shadow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80">Enable Shadow</span>
                <button
                  onClick={() => onUpdateLayer({ shadowEnabled: !activeLayer.shadowEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    activeLayer.shadowEnabled ? 'bg-blue-600' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    activeLayer.shadowEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {activeLayer.shadowEnabled && (
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-[11px] text-white/60 mb-1">
                      <span>Blur Radius</span>
                      <span className="text-blue-400">{activeLayer.shadowBlur || 10}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={activeLayer.shadowBlur || 10}
                      onChange={(e) => onUpdateLayer({ shadowBlur: Number(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-white/60 mb-1">
                        <span>Offset X</span>
                        <span className="text-blue-400">{activeLayer.shadowOffsetX || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={activeLayer.shadowOffsetX || 0}
                        onChange={(e) => onUpdateLayer({ shadowOffsetX: Number(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-white/60 mb-1">
                        <span>Offset Y</span>
                        <span className="text-blue-400">{activeLayer.shadowOffsetY || 4}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={activeLayer.shadowOffsetY || 4}
                        onChange={(e) => onUpdateLayer({ shadowOffsetY: Number(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-white/40 block mb-1.5">Shadow Color</span>
                    <div className="grid grid-cols-8 gap-2">
                      {['#000000', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((c) => (
                        <button
                          key={c}
                          onClick={() => onUpdateLayer({ shadowColor: c })}
                          style={{ backgroundColor: c }}
                          className={`w-8 h-8 rounded-lg border transition-transform active:scale-95 ${
                            activeLayer.shadowColor === c ? 'border-blue-400 ring-2 ring-blue-500/50' : 'border-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OPACITY */}
          {tool === 'opacity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-white/80 font-semibold">
                <span>Opacity (স্বচ্ছতা)</span>
                <span className="text-blue-400 font-bold">{Math.round((activeLayer.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeLayer.opacity ?? 1}
                onChange={(e) => onUpdateLayer({ opacity: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          )}

          {/* ROTATE */}
          {tool === 'rotate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-white/80 font-semibold">
                <span>Angle (ডিগ্রি)</span>
                <span className="text-blue-400 font-bold">{activeLayer.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={activeLayer.rotation || 0}
                onChange={(e) => onUpdateLayer({ rotation: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateLayer({ rotation: ((activeLayer.rotation || 0) - 90) % 360 })}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold"
                >
                  -90°
                </button>
                <button
                  onClick={() => onUpdateLayer({ rotation: 0 })}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold"
                >
                  Reset (0°)
                </button>
                <button
                  onClick={() => onUpdateLayer({ rotation: ((activeLayer.rotation || 0) + 90) % 360 })}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold"
                >
                  +90°
                </button>
              </div>
            </div>
          )}

          {/* POSITION */}
          {tool === 'position' && (
            <div className="space-y-4">
              <div className="text-[11px] text-white/60 text-center">সূক্ষ্মভাবে পজিশন পরিবর্তন করুন (Step Nudge)</div>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                <div />
                <button
                  onClick={() => onUpdateLayer({ y: activeLayer.y - 10 })}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold flex items-center justify-center active:scale-95"
                >
                  ▲
                </button>
                <div />
                <button
                  onClick={() => onUpdateLayer({ x: activeLayer.x - 10 })}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold flex items-center justify-center active:scale-95"
                >
                  ◀
                </button>
                <button
                  onClick={() => onUpdateLayer({ 
                    x: (canvasWidth - activeLayer.width) / 2, 
                    y: (canvasHeight - activeLayer.height) / 2 
                  })}
                  className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-[9px] font-bold flex items-center justify-center uppercase active:scale-95"
                >
                  Center
                </button>
                <button
                  onClick={() => onUpdateLayer({ x: activeLayer.x + 10 })}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold flex items-center justify-center active:scale-95"
                >
                  ▶
                </button>
                <div />
                <button
                  onClick={() => onUpdateLayer({ y: activeLayer.y + 10 })}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold flex items-center justify-center active:scale-95"
                >
                  ▼
                </button>
                <div />
              </div>
            </div>
          )}

          {/* RELATIVE POSITION */}
          {tool === 'relative' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateLayer({ x: (canvasWidth - activeLayer.width) / 2 })}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold border border-white/10"
                >
                  Align Center (H)
                </button>
                <button
                  onClick={() => onUpdateLayer({ y: (canvasHeight - activeLayer.height) / 2 })}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold border border-white/10"
                >
                  Align Center (V)
                </button>
                <button
                  onClick={() => onUpdateLayer({ x: 20 })}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold border border-white/10"
                >
                  Align Left
                </button>
                <button
                  onClick={() => onUpdateLayer({ x: canvasWidth - activeLayer.width - 20 })}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold border border-white/10"
                >
                  Align Right
                </button>
                <button
                  onClick={() => onUpdateLayer({ y: 20 })}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold border border-white/10"
                >
                  Align Top
                </button>
                <button
                  onClick={() => onUpdateLayer({ y: canvasHeight - activeLayer.height - 20 })}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold border border-white/10"
                >
                  Align Bottom
                </button>
              </div>
            </div>
          )}

          {/* 3D / STYLES */}
          {tool === '3d' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateLayer({
                    color: '#ffffff',
                    strokeColor: '#000000',
                    strokeWidth: 3,
                    shadowEnabled: true,
                    shadowColor: '#000000',
                    shadowBlur: 15,
                    shadowOffsetY: 8,
                    fontWeight: 'bold'
                  })}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white text-left"
                >
                  ✨ 3D Glow Stroke
                </button>
                <button
                  onClick={() => onUpdateLayer({
                    color: '#fbbf24',
                    shadowEnabled: true,
                    shadowColor: '#b45309',
                    shadowBlur: 8,
                    shadowOffsetY: 6,
                    fontWeight: 'bold'
                  })}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white text-left"
                >
                  👑 Golden Premium
                </button>
                <button
                  onClick={() => onUpdateLayer({
                    color: '#38bdf8',
                    shadowEnabled: true,
                    shadowColor: '#0284c7',
                    shadowBlur: 20,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    fontWeight: 'bold'
                  })}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white text-left"
                >
                  ⚡ Neon Cyan
                </button>
                <button
                  onClick={() => onUpdateLayer({
                    color: '#ffffff',
                    backgroundColor: '#dc2626',
                    backgroundPadding: 12,
                    backgroundRadius: 8,
                    fontWeight: 'bold'
                  })}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white text-left"
                >
                  🏷️ Red Badge
                </button>
              </div>
            </div>
          )}

          {/* BACKGROUND TOOL */}
          {tool === 'background' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80">Text Box Background</span>
                <button
                  onClick={() => onUpdateLayer({ 
                    backgroundColor: activeLayer.backgroundColor ? undefined : '#000000',
                    backgroundPadding: activeLayer.backgroundPadding || 10,
                    backgroundRadius: activeLayer.backgroundRadius || 8
                  })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    activeLayer.backgroundColor ? 'bg-blue-600' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    activeLayer.backgroundColor ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {activeLayer.backgroundColor && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-8 gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => onUpdateLayer({ backgroundColor: c })}
                        style={{ backgroundColor: c }}
                        className={`w-8 h-8 rounded-lg border transition-transform active:scale-95 ${
                          activeLayer.backgroundColor === c ? 'border-blue-400 ring-2 ring-blue-500/50' : 'border-white/10'
                        }`}
                      />
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-white/60 mb-1">
                      <span>Padding</span>
                      <span className="text-blue-400">{activeLayer.backgroundPadding || 10}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={activeLayer.backgroundPadding || 10}
                      onChange={(e) => onUpdateLayer({ backgroundPadding: Number(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close / Apply button */}
          <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
            >
              Done (সম্পন্ন)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
