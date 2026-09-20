import React, { useState, useMemo, useEffect } from "react";
import { 
  X, 
  Search, 
  Sparkles, 
  FolderHeart, 
  Check, 
  Type, 
  Palette,
  ArrowRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  Maximize2
} from "lucide-react";
import { BACKGROUND_ALBUM_ITEMS, BackgroundAlbumItem } from "../../data/pixelBackgroundAlbum";

interface PixelBackgroundAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (item: BackgroundAlbumItem, addSampleText: boolean, customCaption?: string) => void;
  currentBgSvg?: string | null;
}

type CategoryType = "all" | "poster" | "islamic" | "quotes" | "notice" | "aesthetic";

const CATEGORIES: { id: CategoryType; labelBn: string; count: number; icon: string }[] = [
  { id: "all", labelBn: "সবগুলো (All)", count: BACKGROUND_ALBUM_ITEMS.length, icon: "🌟" },
  { id: "poster", labelBn: "পোস্টার ফ্রেম", count: 28, icon: "🖼️" },
  { id: "islamic", labelBn: "ইসলামিক ও হাদিস", count: 20, icon: "🕌" },
  { id: "quotes", labelBn: "উক্তি ও বাণী", count: 20, icon: "✍️" },
  { id: "notice", labelBn: "বিজ্ঞপ্তি ও অফার", count: 20, icon: "📢" },
  { id: "aesthetic", labelBn: "অ্যাস্থেটিক ও নিয়ন", count: 20, icon: "✨" }
];

const COLOR_FILTERS = [
  { id: "all", label: "সব কালার", color: "transparent" },
  { id: "green", label: "সবুজ", color: "#16a34a" },
  { id: "blue", label: "নীল", color: "#2563eb" },
  { id: "gold", label: "সোনালী", color: "#d97706" },
  { id: "red", label: "লাল / মেরুন", color: "#dc2626" },
  { id: "purple", label: "বেগুনি", color: "#9333ea" },
  { id: "dark", label: "ডার্ক", color: "#18181b" },
  { id: "white", label: "সাদা", color: "#f8fafc" },
];

export const PixelBackgroundAlbumModal: React.FC<PixelBackgroundAlbumModalProps> = ({
  isOpen,
  onClose,
  onSelectBackground,
  currentBgSvg
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addSampleText, setAddSampleText] = useState(true);
  
  // Interactive Preview Modal State
  const [previewItem, setPreviewItem] = useState<BackgroundAlbumItem | null>(null);
  const [customCaption, setCustomCaption] = useState("");
  const [previewWithCaption, setPreviewWithCaption] = useState(true);

  // Sync custom caption whenever preview item changes
  useEffect(() => {
    if (previewItem) {
      setCustomCaption(previewItem.defaultCaption);
      setPreviewWithCaption(true);
    }
  }, [previewItem]);

  const filteredItems = useMemo(() => {
    return BACKGROUND_ALBUM_ITEMS.filter((item) => {
      // Category Match
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;

      // Color Match
      let matchColor = true;
      if (selectedColor !== "all") {
        const c = item.themeColor.toLowerCase();
        if (selectedColor === "green") matchColor = c.includes("15803d") || c.includes("16a34a") || c.includes("065f46") || c.includes("14532d") || c.includes("0f766e") || c.includes("2e7d32") || c.includes("115e59") || c.includes("4d5b24");
        else if (selectedColor === "blue") matchColor = c.includes("1e40af") || c.includes("2563eb") || c.includes("0284c7") || c.includes("1d4ed8") || c.includes("03045e") || c.includes("0f172a") || c.includes("1e3a8a") || c.includes("4338ca") || c.includes("0e7490");
        else if (selectedColor === "gold") matchColor = c.includes("b45309") || c.includes("d97706") || c.includes("d4af37") || c.includes("ca8a04") || c.includes("f59e0b") || c.includes("eab308") || c.includes("c2410c");
        else if (selectedColor === "red") matchColor = c.includes("b91c1c") || c.includes("dc2626") || c.includes("be123c") || c.includes("881337") || c.includes("991b1b") || c.includes("7f1d1d");
        else if (selectedColor === "purple") matchColor = c.includes("7e22ce") || c.includes("9333ea") || c.includes("6b21a8") || c.includes("701a75") || c.includes("581c87");
        else if (selectedColor === "dark") matchColor = c.includes("18181b") || c.includes("09090b") || c.includes("0f172a") || c.includes("27272a") || c.includes("1e293b");
        else if (selectedColor === "white") matchColor = c.includes("ffffff") || c.includes("f8fafc") || c.includes("fffdf7") || c.includes("fef3c7");
      }

      // Search Query
      const matchQuery = 
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameBn.includes(searchQuery) ||
        item.defaultCaption.includes(searchQuery);

      return matchCategory && matchColor && matchQuery;
    });
  }, [selectedCategory, selectedColor, searchQuery]);

  if (!isOpen) return null;

  const handleApply = (item: BackgroundAlbumItem, includeCaption = addSampleText, captionOverride?: string) => {
    onSelectBackground(item, includeCaption, captionOverride);
    setPreviewItem(null);
    onClose();
  };

  // Navigate between designs in preview mode
  const handleNavigatePreview = (direction: "prev" | "next") => {
    if (!previewItem || filteredItems.length === 0) return;
    const currentIndex = filteredItems.findIndex(item => item.id === previewItem.id);
    if (currentIndex === -1) return;

    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = filteredItems.length - 1;
    if (nextIndex >= filteredItems.length) nextIndex = 0;

    setPreviewItem(filteredItems[nextIndex]);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-neutral-900 border border-neutral-800 text-white w-full max-w-5xl h-[94vh] max-h-[870px] rounded-2xl flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* MODAL HEADER */}
        {/* ======================================================== */}
        <div className="px-3.5 sm:px-6 py-3 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900/95">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <FolderHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>ব্যাকগ্রাউন্ড অ্যালবাম</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold">
                    ১০৮+ ডিজাইন
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                যেকোনো ব্যাকগ্রাউন্ডে ক্লিক করে প্রিভিউ দেখুন অথবা সরাসরি ক্যানভাসে সেট করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Toggle for Sample Caption */}
            <button
              onClick={() => setAddSampleText(!addSampleText)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                addSampleText 
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-400" 
                  : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white"
              }`}
              title="ব্যাকগ্রাউন্ড সেট করার সাথে নমুনা ক্যাপশন টেক্সট যোগ করুন"
            >
              <Type className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">নমুনা ক্যাপশন:</span>
              <span className="font-bold">{addSampleText ? "অন" : "অফ"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEARCH & CATEGORY FILTERS */}
        {/* ======================================================== */}
        <div className="px-3.5 sm:px-6 py-2.5 border-b border-neutral-800/80 bg-neutral-950/60 shrink-0 space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ব্যাকগ্রাউন্ড খুঁজুন (যেমন: ইসলামিক, লাল, নীল, হাদিস, বিজ্ঞপ্তি, উক্তি)..."
              className="w-full bg-neutral-800/90 border border-neutral-700/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/60"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.labelBn}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-neutral-700 text-neutral-400"}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Color Filter Dots Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-1 scrollbar-none no-scrollbar text-xs">
            <span className="text-[11px] text-neutral-400 font-medium shrink-0 flex items-center gap-1 mr-1">
              <Palette className="w-3 h-3 text-amber-400" />
              <span>কালার:</span>
            </span>
            {COLOR_FILTERS.map((col) => {
              const isSel = selectedColor === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => setSelectedColor(col.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 border ${
                    isSel 
                      ? "bg-blue-600/30 border-blue-400 text-white font-bold" 
                      : "bg-neutral-800/70 border-neutral-700/50 text-neutral-300 hover:border-neutral-600"
                  }`}
                >
                  {col.id !== "all" && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30"
                      style={{ backgroundColor: col.color }}
                    />
                  )}
                  <span>{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CONTENT BODY: GRID CARDS (FIXED COLLAPSE BUG & ULTRA FAST RENDERING) */}
        {/* ======================================================== */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 auto-rows-max overscroll-contain">
          {filteredItems.map((item) => {
            const isCurrent = currentBgSvg === item.svg;
            return (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 240px' }}
                className={`group relative rounded-xl border overflow-hidden flex flex-col cursor-pointer transition-transform duration-150 active:scale-95 bg-neutral-950 h-auto will-change-transform ${
                  isCurrent 
                    ? "border-blue-500 ring-2 ring-blue-500/50" 
                    : "border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {/* 100% Robust 4:5 Aspect Container with aspect-[4/5] to prevent flex collapse */}
                <div 
                  className="relative w-full aspect-[4/5] min-h-[170px] bg-neutral-900 overflow-hidden flex-shrink-0"
                >
                  {/* Inline Vector SVG Rendering */}
                  <div 
                    className="absolute inset-0 w-full h-full flex items-center justify-center p-1.5 [&>svg]:w-full [&>svg]:h-full [&>svg]:block pointer-events-none transition-transform duration-300 group-hover:scale-105"
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  />

                  {/* Category Pill Tag */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white/90 border border-white/10 shadow-sm flex items-center gap-1">
                      {item.category === "islamic" ? "🕌 ইসলামিক" : item.category === "poster" ? "🖼️ পোস্টার" : item.category === "quotes" ? "✍️ উক্তি" : item.category === "notice" ? "📢 বিজ্ঞপ্তি" : "✨ নিয়ন"}
                    </span>
                  </div>

                  {/* Active Selected Badge */}
                  {isCurrent && (
                    <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Subtle Sample Text Overlay Preview */}
                  <div className="absolute inset-x-2 bottom-2 z-10 pointer-events-none flex flex-col items-center justify-center text-center">
                    <span 
                      className="text-[9px] leading-tight font-semibold line-clamp-2 px-1.5 py-0.5 rounded backdrop-blur-xs bg-black/50 text-white/95 border border-white/10"
                    >
                      {item.defaultCaption.slice(0, 28)}...
                    </span>
                  </div>

                  {/* Desktop Hover Quick Action */}
                  <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex flex-col items-center justify-center p-3 gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/20 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>প্রিভিউ দেখুন</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(item, addSampleText);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ক্যানভাসে নিন</span>
                    </button>
                  </div>
                </div>

                {/* Footer Info & Mobile Touch Buttons */}
                <div className="p-2 sm:p-2.5 bg-neutral-900 border-t border-neutral-800/90 flex flex-col gap-1.5 flex-1 justify-between">
                  <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {item.nameBn}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {item.name}
                      </p>
                    </div>

                    {/* Color Swatch */}
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-sm" 
                      style={{ backgroundColor: item.themeColor }}
                      title={item.name}
                    />
                  </div>

                  {/* Mobile Direct Action Buttons */}
                  <div className="grid grid-cols-2 gap-1 pt-1 sm:hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                      className="py-1 px-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold flex items-center justify-center gap-1 border border-neutral-700"
                    >
                      <Eye className="w-3 h-3 text-blue-400" />
                      <span>প্রিভিউ</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(item, addSampleText);
                      }}
                      className="py-1 px-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-3 h-3" />
                      <span>ব্যবহার</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-neutral-400">
              <FolderHeart className="w-12 h-12 text-neutral-600 mb-3" />
              <p className="text-sm font-semibold text-neutral-300">কোনো ব্যাকগ্রাউন্ড পাওয়া যায়নি</p>
              <p className="text-xs text-neutral-500 mt-1">অন্য কোনো নাম বা ফিল্টার দিয়ে চেষ্টা করুন</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedColor("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-1.5 rounded-lg bg-neutral-800 text-xs text-white hover:bg-neutral-700"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* BOTTOM BAR INFO */}
        {/* ======================================================== */}
        <div className="px-3.5 sm:px-6 py-2.5 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2 shrink-0">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              ডিজাইনে ক্লিক করে বড় প্রিভিউ দেখুন এবং পছন্দমতো ক্যাপশন সহ ক্যানভাসে সেট করুন।
            </span>
          </div>

          <div className="text-[11px] text-neutral-400 font-semibold shrink-0">
            উপলব্ধ: {filteredItems.length} টি / মোট ১০৮ টি
          </div>
        </div>

        {/* ======================================================== */}
        {/* FULL INTERACTIVE PREVIEW & CAPTION MODAL (PREVIEW ITEM) */}
        {/* ======================================================== */}
        {previewItem && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in duration-200">
            {/* Preview Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 sm:p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">তালিকায় ফিরুন</span>
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{previewItem.nameBn}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {previewItem.categoryBn}
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">{previewItem.name}</p>
                </div>
              </div>

              {/* Prev / Next Design Switchers */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavigatePreview("prev")}
                  title="পূর্ববর্তী ডিজাইন"
                  className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNavigatePreview("next")}
                  title="পরবর্তী ডিজাইন"
                  className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Modal Content Body */}
            <div className="flex-1 min-h-0 overflow-y-auto py-3 sm:py-5 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8">
              {/* Large Frame Preview Container */}
              <div className="w-full max-w-[290px] sm:max-w-[340px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-2 border-neutral-700 bg-neutral-950 relative shrink-0">
                {/* SVG Background */}
                <div 
                  className="absolute inset-0 w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: previewItem.svg }}
                />

                {/* Overlaid Caption Preview */}
                {previewWithCaption && (
                  <div className="absolute inset-x-5 top-1/3 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center text-center p-3">
                    <p 
                      className="text-xs sm:text-sm leading-relaxed font-bold tracking-wide break-words whitespace-pre-line"
                      style={{ color: previewItem.textColor }}
                    >
                      {customCaption || previewItem.defaultCaption}
                    </p>
                  </div>
                )}
              </div>

              {/* Options & Setup Panel */}
              <div className="w-full max-w-md flex flex-col gap-3.5 bg-neutral-950/80 p-4 sm:p-5 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">ক্যাপশন ও এডিট অপশন</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-400">ক্যাপশন:</span>
                    <button
                      onClick={() => setPreviewWithCaption(!previewWithCaption)}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                        previewWithCaption
                          ? "bg-blue-600/30 border-blue-400 text-blue-400"
                          : "bg-neutral-800 border-neutral-700 text-neutral-400"
                      }`}
                    >
                      {previewWithCaption ? "অন (সহ)" : "অফ (ছাড়া)"}
                    </button>
                  </div>
                </div>

                {/* Caption Input / Editor */}
                {previewWithCaption && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-neutral-300 font-semibold flex items-center justify-between">
                      <span>ক্যাপশন টেক্সট (প্রয়োজনে পরিবর্তন করুন):</span>
                      <button 
                        onClick={() => setCustomCaption(previewItem.defaultCaption)}
                        className="text-[10px] text-blue-400 hover:underline"
                      >
                        মূল টেক্সট আনুন
                      </button>
                    </label>
                    <textarea
                      rows={3}
                      value={customCaption}
                      onChange={(e) => setCustomCaption(e.target.value)}
                      placeholder="এখানে আপনার হাদিস, উক্তি বা বিজ্ঞপ্তির লেখা লিখুন..."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                )}

                {/* Theme Details Chips */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 pt-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: previewItem.themeColor }} />
                    <span>থিম: {previewItem.nameBn}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: previewItem.textColor }} />
                    <span>টেক্সট কালার</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => handleApply(previewItem, previewWithCaption, customCaption)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{previewWithCaption ? "ক্যাপশন সহ ক্যানভাসে নিন" : "ক্যানভাসে ব্যবহার করুন"}</span>
                  </button>

                  <button
                    onClick={() => handleApply(previewItem, false)}
                    className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-700 flex items-center justify-center gap-1.5 transition-all"
                    title="কোনো টেক্সট ছাড়া শুধু ব্যাকগ্রাউন্ড ফ্রেমটি ক্যানভাসে সেট করুন"
                  >
                    <span>শুধু ফ্রেম নিন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
