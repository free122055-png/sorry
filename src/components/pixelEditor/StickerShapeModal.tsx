import React, { useState } from 'react';
import { X, Search, Sparkles, Shapes, Sticker, Quote, Calendar, Maximize, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STICKER_LIBRARY, SHAPE_OPTIONS, PRESET_QUOTES, COLOR_PALETTE } from '../../data/pixelEditorData';

interface StickerShapeModalProps {
  type: 'stickers' | 'shapes' | 'quotes' | 'date' | 'image-size' | 'bg-color' | null;
  onClose: () => void;
  onAddSticker?: (sticker: typeof STICKER_LIBRARY[0]) => void;
  onAddShape?: (shape: typeof SHAPE_OPTIONS[0]['type'], color: string) => void;
  onAddQuote?: (quoteText: string) => void;
  onAddDate?: (dateText: string) => void;
  onApplyImageSize?: (width: number, height: number, name: string) => void;
  onApplyBgColor?: (color: string) => void;
  currentWidth?: number;
  currentHeight?: number;
  currentBgColor?: string;
}

export const StickerShapeModal: React.FC<StickerShapeModalProps> = ({
  type,
  onClose,
  onAddSticker,
  onAddShape,
  onAddQuote,
  onAddDate,
  onApplyImageSize,
  onApplyBgColor,
  currentWidth = 1000,
  currentHeight = 1000,
  currentBgColor = 'bg-white'
}) => {
  const [selectedShapeColor, setSelectedShapeColor] = useState('#3b82f6');
  const [customW, setCustomW] = useState(currentWidth.toString());
  const [customH, setCustomH] = useState(currentHeight.toString());
  const [quoteSearch, setQuoteSearch] = useState('');

  if (!type) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          exit={{ y: '100%' }} 
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#121212] w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] max-h-[85vh] flex flex-col relative border border-white/10 shadow-2xl z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {type === 'stickers' && <Sticker className="w-5 h-5 text-pink-400" />}
              {type === 'shapes' && <Shapes className="w-5 h-5 text-blue-400" />}
              {type === 'quotes' && <Quote className="w-5 h-5 text-yellow-400" />}
              {type === 'date' && <Calendar className="w-5 h-5 text-emerald-400" />}
              {type === 'image-size' && <Maximize className="w-5 h-5 text-indigo-400" />}
              {type === 'bg-color' && <Palette className="w-5 h-5 text-purple-400" />}
              
              <h3 className="text-sm font-bold text-white tracking-wide">
                {type === 'stickers' && 'স্টিকার লাইব্রেরি (Stickers)'}
                {type === 'shapes' && 'আকৃতি ও শেপ (Shapes)'}
                {type === 'quotes' && 'উক্তি ও বাণী (Quotes)'}
                {type === 'date' && 'তারিখ যোগ করুন (Add Date)'}
                {type === 'image-size' && 'ক্যানভাস সাইজ (Image Size)'}
                {type === 'bg-color' && 'ব্যাকগ্রাউন্ড কালার (Canvas Color)'}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* STICKERS */}
            {type === 'stickers' && (
              <div className="grid grid-cols-2 gap-3">
                {STICKER_LIBRARY.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      onAddSticker?.(st);
                      onClose();
                    }}
                    style={{ borderColor: `${st.color}40`, backgroundColor: `${st.color}15` }}
                    className="p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-center group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">{st.icon}</span>
                    <span className="text-xs font-bold tracking-wider" style={{ color: st.color }}>
                      {st.content}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* SHAPES */}
            {type === 'shapes' && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-white/60 block mb-2">শেপের কালার নির্বাচন করুন:</span>
                  <div className="grid grid-cols-8 gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedShapeColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-8 h-8 rounded-lg border transition-transform active:scale-95 ${
                          selectedShapeColor === c ? 'border-white ring-2 ring-blue-500' : 'border-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {SHAPE_OPTIONS.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => {
                        onAddShape?.(shape.type, selectedShapeColor);
                        onClose();
                      }}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <div 
                        style={{ backgroundColor: selectedShapeColor }}
                        className={`w-12 h-12 flex items-center justify-center shadow-lg ${
                          shape.type === 'circle' ? 'rounded-full' :
                          shape.type === 'rounded-rect' ? 'rounded-2xl' :
                          shape.type === 'triangle' ? 'clip-triangle' :
                          'rounded-none'
                        }`}
                      />
                      <span className="text-xs font-semibold text-white/90">{shape.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUOTES */}
            {type === 'quotes' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  placeholder="উক্তি খুঁজুন (Search quotes)..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />

                <div className="space-y-2">
                  {PRESET_QUOTES.filter(q => q.text.toLowerCase().includes(quoteSearch.toLowerCase()) || q.category.toLowerCase().includes(quoteSearch.toLowerCase())).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        onAddQuote?.(q.text);
                        onClose();
                      }}
                      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all flex flex-col gap-1 group"
                    >
                      <span className="text-[10px] font-bold text-blue-400 uppercase">{q.category}</span>
                      <p className="text-sm font-medium text-white/90 group-hover:text-white leading-relaxed">
                        "{q.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DATE */}
            {type === 'date' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-white/60 block mb-2">তারিখের ফরম্যাট সিলেক্ট করুন:</span>
                {[
                  new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
                  new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
                  new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                  `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                ].map((dStr, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onAddDate?.(dStr);
                      onClose();
                    }}
                    className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600/10 hover:border-blue-500/40 text-sm font-medium text-white transition-all"
                  >
                    📅 {dStr}
                  </button>
                ))}
              </div>
            )}

            {/* IMAGE SIZE */}
            {type === 'image-size' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-1 block">Width (প্রস্থ)</label>
                    <input
                      type="number"
                      value={customW}
                      onChange={(e) => setCustomW(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-1 block">Height (উচ্চতা)</label>
                    <input
                      type="number"
                      value={customH}
                      onChange={(e) => setCustomH(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-white/40 uppercase">Standard Presets:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: '1:1 Square (Square)', w: 1080, h: 1080 },
                      { name: '16:9 YouTube', w: 1280, h: 720 },
                      { name: 'FB Cover Size', w: 820, h: 312 },
                      { name: 'Story / Reels (9:16)', w: 1080, h: 1920 },
                      { name: 'ID Card (Landscape)', w: 1011, h: 638 },
                      { name: 'FB Group Cover', w: 1640, h: 856 }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCustomW(p.w.toString());
                          setCustomH(p.h.toString());
                        }}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-left text-xs text-white/80 transition-colors truncate"
                      >
                        {p.name} ({p.w}x{p.h})
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const w = parseInt(customW, 10) || 1000;
                    const h = parseInt(customH, 10) || 1000;
                    onApplyImageSize?.(w, h, 'Custom Size');
                    onClose();
                  }}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Apply Canvas Size
                </button>
              </div>
            )}

            {/* BG COLOR */}
            {type === 'bg-color' && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-white/60 block mb-2">Preset Colors</span>
                  <div className="grid grid-cols-6 gap-2.5">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          onApplyBgColor?.(c);
                          onClose();
                        }}
                        style={{ backgroundColor: c }}
                        className="w-12 h-12 rounded-xl border border-white/20 active:scale-95 transition-transform"
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-white/60 block mb-2">Gradients</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Sunset Glow', class: 'bg-gradient-to-r from-red-800 to-orange-400' },
                      { name: 'Royal Blue', class: 'bg-gradient-to-r from-blue-900 to-blue-600' },
                      { name: 'Purple Night', class: 'bg-gradient-to-b from-red-600 to-indigo-900' },
                      { name: 'Emerald Forest', class: 'bg-gradient-to-r from-emerald-900 to-teal-600' }
                    ].map((g, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onApplyBgColor?.(g.class);
                          onClose();
                        }}
                        className={`p-3 rounded-xl border border-white/10 ${g.class} text-xs font-bold text-white active:scale-95 transition-all text-center`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
