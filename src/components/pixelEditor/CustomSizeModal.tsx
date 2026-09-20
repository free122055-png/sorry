import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Sparkles, RotateCw, Plus, Minus, Check, Layers,
  Maximize2, Smartphone, Monitor, Image as ImageIcon,
  CreditCard, FileText, Layout, Palette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CustomSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (width: number, height: number, name: string, bgClass?: string) => void;
  initialWidth?: number;
  initialHeight?: number;
  initialName?: string;
  initialBgClass?: string;
}

// Convert Bengali and Arabic numerals to English digits
const toEnglishDigits = (str: string): string => {
  const bnDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return str.replace(/[০-৯٠-٩]/g, (d) => bnDigits[d] || d).replace(/[^0-9]/g, '');
};

// Greatest Common Divisor for aspect ratio
const calculateGcd = (a: number, b: number): number => {
  return b === 0 ? a : calculateGcd(b, a % b);
};

interface PresetItem {
  id: string;
  name: string;
  subtitle: string;
  w: number;
  h: number;
  icon: React.ReactNode;
  category: "social" | "video" | "print" | "card";
}

const PRESET_LIST: PresetItem[] = [
  { id: "sq", name: "1:1 বর্গ পোস্ট", subtitle: "Instagram / FB Feed", w: 1080, h: 1080, icon: <Layout className="w-3.5 h-3.5" />, category: "social" },
  { id: "story", name: "9:16 স্টোরি / রিলস", subtitle: "Reels, TikTok, Shorts", w: 1080, h: 1920, icon: <Smartphone className="w-3.5 h-3.5" />, category: "social" },
  { id: "yt", name: "16:9 থাম্বনেইল", subtitle: "YouTube Thumbnail", w: 1280, h: 720, icon: <Monitor className="w-3.5 h-3.5" />, category: "video" },
  { id: "port", name: "4:5 পোর্ট্রেট পোস্ট", subtitle: "High Engagement Post", w: 1080, h: 1350, icon: <ImageIcon className="w-3.5 h-3.5" />, category: "social" },
  { id: "fbcover", name: "ফেসবুক কভার", subtitle: "FB Page / Profile", w: 1640, h: 856, icon: <Layout className="w-3.5 h-3.5" />, category: "social" },
  { id: "banner", name: "ওয়েব / অ্যাড ব্যানার", subtitle: "Marketing Banner", w: 1200, h: 630, icon: <Maximize2 className="w-3.5 h-3.5" />, category: "social" },
  { id: "idcard", name: "আইডি কার্ড", subtitle: "PVC ID Card Size", w: 1011, h: 638, icon: <CreditCard className="w-3.5 h-3.5" />, category: "card" },
  { id: "a4", name: "A4 প্রিন্ট পেপার", subtitle: "Document / Print Ready", w: 2480, h: 3508, icon: <FileText className="w-3.5 h-3.5" />, category: "print" },
];

const BG_OPTIONS = [
  { id: "bg-white", label: "সাদা", colorClass: "bg-white", border: "border-gray-300" },
  { id: "bg-black", label: "কালো", colorClass: "bg-black", border: "border-neutral-700" },
  { id: "bg-transparent", label: "ট্রান্সপারেন্ট", isTransparent: true, border: "border-white/20" },
  { id: "bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-950", label: "রয়্যাল ব্লু", colorClass: "bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-950", border: "border-blue-500/40" },
  { id: "bg-gradient-to-tr from-purple-950 via-neutral-900 to-rose-950", label: "নিয়ন ম্যাজেন্টা", colorClass: "bg-gradient-to-tr from-purple-950 via-neutral-900 to-rose-950", border: "border-purple-500/40" },
];

export const CustomSizeModal: React.FC<CustomSizeModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialWidth = 1080,
  initialHeight = 1080,
  initialName = "কাস্টম সাইজ",
  initialBgClass = "bg-white"
}) => {
  const [widthInput, setWidthInput] = useState<string>(String(initialWidth));
  const [heightInput, setHeightInput] = useState<string>(String(initialHeight));
  const [nameInput, setNameInput] = useState<string>(initialName);
  const [selectedBg, setSelectedBg] = useState<string>(initialBgClass);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Sync with initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setWidthInput(String(initialWidth || 1080));
      setHeightInput(String(initialHeight || 1080));
      setNameInput(initialName || "কাস্টম সাইজ");
      setSelectedBg(initialBgClass || "bg-white");
      
      const matchedPreset = PRESET_LIST.find(
        p => p.w === (initialWidth || 1080) && p.h === (initialHeight || 1080)
      );
      setSelectedPresetId(matchedPreset ? matchedPreset.id : null);
    }
  }, [isOpen, initialWidth, initialHeight, initialName, initialBgClass]);

  // Numerical values
  const currentW = useMemo(() => {
    const parsed = parseInt(widthInput, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [widthInput]);

  const currentH = useMemo(() => {
    const parsed = parseInt(heightInput, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [heightInput]);

  // Dynamic Aspect Ratio and Resolution info
  const { ratioLabel, megapixels, isUltraHd, wireframeAspect } = useMemo(() => {
    const w = currentW || 1080;
    const h = currentH || 1080;
    const mp = ((w * h) / 1_000_000).toFixed(2);
    const gcdVal = calculateGcd(w, h);
    const simpleW = w / gcdVal;
    const simpleH = h / gcdVal;

    let label = `${simpleW}:${simpleH}`;
    const ratio = w / h;

    if (Math.abs(ratio - 1) < 0.02) {
      label = "1:1 Square (বর্গ)";
    } else if (Math.abs(ratio - 16 / 9) < 0.03) {
      label = "16:9 Landscape (ল্যান্ডস্কেপ)";
    } else if (Math.abs(ratio - 9 / 16) < 0.03) {
      label = "9:16 Portrait (স্টোরি/রিলস)";
    } else if (Math.abs(ratio - 4 / 5) < 0.03) {
      label = "4:5 Portrait (পোস্ট)";
    } else if (Math.abs(ratio - 1.91) < 0.05) {
      label = "1.91:1 Banner (ব্যানার)";
    }

    return {
      ratioLabel: label,
      megapixels: mp,
      isUltraHd: (w >= 1920 || h >= 1920),
      wireframeAspect: Math.min(2.2, Math.max(0.45, ratio))
    };
  }, [currentW, currentH]);

  // Step adjust helpers
  const adjustWidth = (delta: number) => {
    const next = Math.max(50, Math.min(10000, (currentW || 1080) + delta));
    setWidthInput(String(next));
    setSelectedPresetId(null);
  };

  const adjustHeight = (delta: number) => {
    const next = Math.max(50, Math.min(10000, (currentH || 1080) + delta));
    setHeightInput(String(next));
    setSelectedPresetId(null);
  };

  // Swap Width and Height
  const handleSwap = () => {
    const tempW = widthInput;
    setWidthInput(heightInput);
    setHeightInput(tempW);
    setSelectedPresetId(null);
  };

  // Select Preset
  const handleSelectPreset = (preset: PresetItem) => {
    setWidthInput(String(preset.w));
    setHeightInput(String(preset.h));
    setNameInput(preset.name);
    setSelectedPresetId(preset.id);
  };

  // Handle Create / Apply
  const handleApply = () => {
    const finalW = Math.max(50, Math.min(10000, currentW || 1080));
    const finalH = Math.max(50, Math.min(10000, currentH || 1080));
    const finalName = nameInput.trim() || `${finalW} × ${finalH}`;
    onApply(finalW, finalH, finalName, selectedBg);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="custom-size-modal-overlay"
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 15 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-[#0e0e17] border border-white/15 rounded-[28px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col my-auto max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#141422] to-[#10101b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-md shadow-amber-500/10">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  কাস্টম ডিজাইন সাইজ (Custom Size)
                </h3>
                <p className="text-[10.5px] text-gray-400">
                  পছন্দমতো মাপ লিখে বা জনপ্রিয় সাইজ সিলেক্ট করে ক্যানভাস তৈরি করুন
                </p>
              </div>
            </div>
            <button
              id="custom-size-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-4 bg-[#08080f] no-scrollbar">
            
            {/* 1. Dimension Inputs Card */}
            <div className="bg-[#12121e] border border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  ক্যানভাসের আকার (Pixel Dimensions)
                </span>
                {/* Live Aspect & Quality Badge */}
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-[10px] font-bold">
                    {ratioLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                    {megapixels} MP {isUltraHd && "• Ultra HD"}
                  </span>
                </div>
              </div>

              {/* Input Boxes with Steppers & Swap Button */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                
                {/* Width Input Block */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-gray-400 px-1">
                    <span>প্রস্থ (Width)</span>
                    <span className="font-mono text-[9.5px] text-gray-500">PX</span>
                  </div>
                  <div className="relative flex items-center bg-[#090912] border border-white/15 focus-within:border-blue-500 rounded-xl overflow-hidden transition-all shadow-inner">
                    <input
                      id="custom-width-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={widthInput}
                      onChange={(e) => {
                        const cleaned = toEnglishDigits(e.target.value);
                        setWidthInput(cleaned);
                        setSelectedPresetId(null);
                      }}
                      onBlur={() => {
                        if (!widthInput || parseInt(widthInput, 10) < 50) {
                          setWidthInput("1080");
                        }
                      }}
                      placeholder="1080"
                      className="w-full px-3 py-2.5 bg-transparent text-white font-mono font-black text-base sm:text-lg focus:outline-none placeholder-gray-600"
                    />
                    {/* Steppers */}
                    <div className="flex items-center pr-1 gap-0.5">
                      <button
                        type="button"
                        onClick={() => adjustWidth(-50)}
                        className="w-6 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-all text-xs active:scale-90"
                        title="-50px"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustWidth(50)}
                        className="w-6 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-all text-xs active:scale-90"
                        title="+50px"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Swap Dimensions Button */}
                <div className="pt-4 flex flex-col items-center">
                  <button
                    id="custom-size-swap-btn"
                    type="button"
                    onClick={handleSwap}
                    title="উচ্চতা ও প্রস্থ অদলবদল (Swap)"
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/15 hover:border-blue-500/40 text-gray-300 hover:text-blue-400 flex items-center justify-center transition-all active:scale-90 shadow-md group"
                  >
                    <RotateCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
                  </button>
                </div>

                {/* Height Input Block */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-gray-400 px-1">
                    <span>উচ্চতা (Height)</span>
                    <span className="font-mono text-[9.5px] text-gray-500">PX</span>
                  </div>
                  <div className="relative flex items-center bg-[#090912] border border-white/15 focus-within:border-blue-500 rounded-xl overflow-hidden transition-all shadow-inner">
                    <input
                      id="custom-height-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={heightInput}
                      onChange={(e) => {
                        const cleaned = toEnglishDigits(e.target.value);
                        setHeightInput(cleaned);
                        setSelectedPresetId(null);
                      }}
                      onBlur={() => {
                        if (!heightInput || parseInt(heightInput, 10) < 50) {
                          setHeightInput("1080");
                        }
                      }}
                      placeholder="1080"
                      className="w-full px-3 py-2.5 bg-transparent text-white font-mono font-black text-base sm:text-lg focus:outline-none placeholder-gray-600"
                    />
                    {/* Steppers */}
                    <div className="flex items-center pr-1 gap-0.5">
                      <button
                        type="button"
                        onClick={() => adjustHeight(-50)}
                        className="w-6 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-all text-xs active:scale-90"
                        title="-50px"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustHeight(50)}
                        className="w-6 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-all text-xs active:scale-90"
                        title="+50px"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Canvas Wireframe Thumbnail */}
              <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  {/* Dynamic Wireframe Box */}
                  <div 
                    className="h-8 border-2 border-dashed border-blue-400/80 bg-blue-500/10 rounded flex items-center justify-center transition-all duration-200"
                    style={{
                      width: `${Math.round(32 * wireframeAspect)}px`,
                      maxWidth: '64px',
                      minWidth: '16px'
                    }}
                  />
                  <span className="text-[10px] font-mono text-gray-300">
                    {currentW || 1080} × {currentH || 1080} px
                  </span>
                </div>

                <span className="text-[10px] text-gray-500">
                  {currentW >= currentH ? "ল্যান্ডস্কেপ / স্কয়ার ক্যানভাস" : "পোর্ট্রেট / লম্বা ক্যানভাস"}
                </span>
              </div>
            </div>

            {/* 2. Popular Presets (জনপ্রিয় রেডিমেড সাইজ) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  জনপ্রিয় রেডিমেড সাইজ (1-Tap Presets):
                </label>
                <span className="text-[9.5px] text-gray-500">ক্লিক করলেই সাইজ সেট হবে</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_LIST.map((preset) => {
                  const isSelected = selectedPresetId === preset.id || (currentW === preset.w && currentH === preset.h);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      id={`preset-btn-${preset.id}`}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between gap-1 shadow-sm relative overflow-hidden ${
                        isSelected
                          ? "bg-blue-600/25 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400"
                          : "bg-[#12121e] hover:bg-[#181828] border-white/10 text-gray-300 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400"}`}>
                          {preset.icon}
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-0.5">
                        <span className={`text-[11px] block font-bold truncate leading-tight ${isSelected ? "text-blue-200" : "text-white"}`}>
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 block mt-0.5">
                          {preset.w} × {preset.h}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Project Name & Background Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Project / Canvas Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-300">ডিজাইনের নাম (ঐচ্ছিক)</label>
                <input
                  id="custom-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="যেমন: মাই কাস্টম ব্যানার"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#12121e] border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              {/* Starting Background Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-purple-400" />
                  শুরুর ব্যাকগ্রাউন্ড
                </label>
                <div className="flex items-center gap-1.5 bg-[#12121e] border border-white/15 rounded-xl p-1.5">
                  {BG_OPTIONS.map((bg) => {
                    const isBgSelected = selectedBg === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setSelectedBg(bg.id)}
                        title={bg.label}
                        className={`flex-1 h-7 rounded-lg border flex items-center justify-center transition-all relative ${
                          bg.isTransparent
                            ? "bg-[linear-gradient(45deg,#222_25%,transparent_25%),linear-gradient(-45deg,#222_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#222_75%),linear-gradient(-45deg,transparent_75%,#222_75%)] bg-[size:8px_8px] bg-[#111]"
                            : bg.colorClass
                        } ${
                          isBgSelected
                            ? "ring-2 ring-blue-500 scale-105 border-white"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        {isBgSelected && (
                          <Check className={`w-3.5 h-3.5 ${bg.id === 'bg-white' ? 'text-black' : 'text-white'} drop-shadow`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-white/10 bg-[#12121e] flex items-center gap-3">
            <button
              id="custom-size-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-all active:scale-95 text-center border border-white/10"
            >
              বাতিল
            </button>
            <button
              id="custom-size-create-btn"
              type="button"
              onClick={handleApply}
              className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ক্যানভাস তৈরি করুন (CREATE)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
